package org.agromarket.agro_server.service.customer.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.common.OrderStatus;
import org.agromarket.agro_server.common.PaymentMethod;
import org.agromarket.agro_server.common.Role;
import org.agromarket.agro_server.exception.CustomException;
import org.agromarket.agro_server.exception.NotFoundException;
import org.agromarket.agro_server.model.dto.request.CheckoutRequest;
import org.agromarket.agro_server.model.dto.response.OrderResponse;
import org.agromarket.agro_server.model.entity.*;
import org.agromarket.agro_server.repositories.customer.*;
import org.agromarket.agro_server.service.customer.CouponService;
import org.agromarket.agro_server.service.customer.NotificationService;
import org.agromarket.agro_server.service.customer.OrderService;
import org.agromarket.agro_server.util.mapper.OrderMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final LineItemRepository lineItemRepository;
    private final CouponService couponService;
    private final NotificationService notificationService;

    @Override
    public OrderResponse checkoutByCOD(CheckoutRequest checkoutRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        long userId = user.getId();
        String lineItemIds = checkoutRequest.getLineItemIds();

        // check
        checkBeforeCreateOrder(userId, lineItemIds);

        List<LineItem> lineItems = getLineItemsByIds(lineItemIds);
        double totalAmount = getAmountFromListLineItem(lineItemIds);

        // Áp dụng mã giảm giá (nếu có)
        String couponCode = checkoutRequest.getCouponCode();
        Coupon coupon = null;
        if (couponCode != null && !couponCode.isBlank()) {
            coupon = couponService.getValidCoupon(couponCode, userId, totalAmount);
            totalAmount = couponService.applyCoupon(coupon, totalAmount);
        }

        // tao Order
        Order order = new Order();
        order.setUser(user);
        order.setLineItems(lineItems);
        order.setShippingAddress(checkoutRequest.getShippingAddress());
        order.setNote(checkoutRequest.getNote());
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.COD);
        order.setIsActive(true);

        if (coupon != null) {
            order.setCoupon(coupon);
        }

        List<Product> productToSave = new ArrayList<>();
        for (LineItem lineItem : lineItems) {
            lineItem.setOrder(order);
            lineItem.setCart(null); // xoa ra khoi cart

            // tru quantity san pham
            Product product = lineItem.getProduct();
            product.setQuantity(product.getQuantity() - lineItem.getQuantity());
            productToSave.add(product);
        }
        OrderResponse orderResponse = orderMapper.convertToResponse(orderRepository.save(order));
        lineItemRepository.saveAll(lineItems);
        productRepository.saveAll(productToSave);


        // Tạo thông báo gửi riêng cho người dùng đặt hàng thành công
        Notification notification = new Notification();
        notification.setTitle("Đặt hàng thành công!");
        notification.setContent("Đơn hàng của bạn đã được đặt thành công. Giá trị của đơn hàng là " + totalAmount);
        notification.setReadStatus(false);
        notification.setCreatedDate(LocalDateTime.now());
        notification.setUser(user);
        notificationService.createAndSendNotification(notification);

        return orderResponse;
    }

    @Override
    public OrderResponse confirmCODOrder(long orderId) {
        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() -> new NotFoundException("Order cannot found!"));

        if (!order.getStatus().equals(OrderStatus.PENDING)
                || order.getIsDeleted()
                || !order.getIsActive()) {
            throw new CustomException("Failed. Order has not pending yet!", 400);
        }

        // change order status
        order.setStatus(OrderStatus.CONFIRMED);
        order.setIsActive(true);
        orderRepository.save(order);

        // Tạo thông báo gửi riêng cho người dùng đơn hàng được xác nhận
        Notification notification = new Notification();
        notification.setTitle("Đặt hàng thành công!");
        notification.setContent("Đơn hàng của bạn đã xác nhận.");
        notification.setReadStatus(false);
        notification.setCreatedDate(LocalDateTime.now());
        notification.setUser(order.getUser());
        notificationService.createAndSendNotification(notification);
        return orderMapper.convertToResponse(order);
    }

    @Override
    public OrderResponse makeOrder(long userId, CheckoutRequest checkoutRequest) {
        String lineItemIds = checkoutRequest.getLineItemIds();
        // check
        checkBeforeCreateOrder(userId, lineItemIds);

        List<LineItem> lineItems = getLineItemsByIds(lineItemIds);
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() -> new NotFoundException("User cannot fount to create Order"));

        double totalAmount = getAmountFromListLineItem(lineItemIds);

        // Áp dụng mã giảm giá (nếu có)
        String couponCode = checkoutRequest.getCouponCode();
        Coupon coupon = null;
        if (couponCode != null && !couponCode.isBlank()) {
            coupon = couponService.getValidCoupon(couponCode, userId, totalAmount);
            totalAmount = couponService.applyCoupon(coupon, totalAmount);
        }

        // tao Order
        Order order = new Order();
        order.setUser(user);
        order.setLineItems(lineItems);
        order.setShippingAddress(checkoutRequest.getShippingAddress());
        order.setNote(checkoutRequest.getNote());
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.WAITING);
        order.setIsActive(false); // tram thoi off, doi thanh toan

        if (coupon != null) {
            order.setCoupon(coupon);
        }

        List<Product> productToSave = new ArrayList<>();
        for (LineItem lineItem : lineItems) {
            lineItem.setOrder(order);

            // tru quantity san pham va cong them so luoc mua
            Product product = lineItem.getProduct();
            product.setQuantity(product.getQuantity() - lineItem.getQuantity());
            product.setPurchaseCount(product.getPurchaseCount() + lineItem.getQuantity());
            productToSave.add(product);
        }
        OrderResponse orderResponse = orderMapper.convertToResponse(orderRepository.save(order));
        lineItemRepository.saveAll(lineItems);

        productRepository.saveAll(productToSave);

        return orderResponse;
    }

    @Override
    public OrderResponse confirmOrder(Order order) {
        if (!order.getStatus().equals(OrderStatus.PENDING) || order.getIsDeleted()) {
            throw new CustomException(
                    "Order processing request has been expired! Please try again.", 400);
        }

        // change order status
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentMethod(PaymentMethod.PAID);
        order.setPaymentDate(LocalDateTime.now());
        order.setIsActive(true);
        orderRepository.save(order);

        // xoa ra khoi cart
        for (LineItem lineItem : order.getLineItems()) {
            lineItem.setCart(null);
        }
        lineItemRepository.saveAll(order.getLineItems());

        return orderMapper.convertToResponse(order);
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> cancelOrder(long orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        long currUserId = currUser.getId();

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() -> new NotFoundException("Order cannot found!"));

        OrderStatus oldStatus = order.getStatus();
        long ownerId = order.getUser().getId();
        LocalDateTime createdTime = order.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        String message = "";

        // --CHECK--
        // role
        if (!(ownerId == currUserId) && !(currUser.getRole().equals(Role.ADMIN))) {
            throw new CustomException("You dont have permission to cancel this order!", 403);
        }

        // ko cho huy order thanh toan by CARD
        if (order.getPaymentMethod().equals(PaymentMethod.PAID)) {
            throw new CustomException("This Order has aldready been paid!", 400);
        }

        // chi cho phep huy order PENDING || CONFIRMED || PROCESSING
        if (!oldStatus.equals(OrderStatus.PENDING)
                && !oldStatus.equals(OrderStatus.CONFIRMED)
                && !oldStatus.equals(OrderStatus.PROCESSING)) {
            throw new CustomException("Order cancellation is no longer available!", 400);
        }

        // ko cho huy order duoc tao hon 30p truoc
        if (createdTime.isBefore(now.minusMinutes(30))) {
            throw new CustomException(
                    "Order cancellation is no longer available "
                            + "as more than 30 minutes have passed since order placement!.",
                    400);
        }

        // --OK---
        if (oldStatus.equals(OrderStatus.PENDING)) {
            // PENDING
            order.setStatus(OrderStatus.CANCELED);
            order.setIsDeleted(true);
            restock(order.getLineItems());
            message = "Cancel order successfully!";
            log.info("Order with id {} cancelled.", orderId);
        } else {
            // CONFIRMED || PROCESSING
            order.setPreviousStatus(oldStatus);
            order.setStatus(OrderStatus.CANCELED_REQUEST);
            message = "Send cancel order request successfully!";
            log.info("Order {} cancellation requested. Previous status: {}", orderId, oldStatus);
        }

        orderRepository.save(order);

        // Tạo thông báo gửi riêng cho người dùng hủy đơn hàng thành công
        Notification notification = new Notification();
        notification.setTitle("Đặt hàng của bạn bị hủy.");
        notification.setContent("Đơn hàng của bạn đã hủy.");
        notification.setReadStatus(false);
        notification.setCreatedDate(LocalDateTime.now());
        notification.setUser(order.getUser());
        notificationService.createAndSendNotification(notification);

        return ResponseEntity.ok(new BaseResponse(message, 200, orderMapper.convertToResponse(order)));
    }

    @Transactional
    @Override
    public OrderResponse handleCancelRequest(long orderId, boolean isApproved) {
        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() -> new NotFoundException("Order not found!"));

        if (order.getStatus() != OrderStatus.CANCELED_REQUEST) {
            throw new CustomException("This order does not have a pending cancellation request!", 400);
        }

        if (isApproved) {
            // admin đồng ý hủy -> chuyển trạng thái CANCELED
            order.setStatus(OrderStatus.CANCELED);
            order.setIsDeleted(true);
            restock(order.getLineItems());
            log.info("Order has been canceled successfully!");
        } else {
            // admin từ chối -> quay lại trạng thái cũ
            order.setStatus(order.getPreviousStatus());
            order.setPreviousStatus(null);
            log.info("Order cancellation request has been rejected!");
        }

        orderRepository.save(order);
        log.info("Order {} cancellation request {}.", orderId, isApproved ? "approved" : "rejected");
        return orderMapper.convertToResponse(order);
    }

    @Transactional
    @Override
    public void restock(List<LineItem> lineItems) {
        for (LineItem lineItem : lineItems) {
            // reset product quantity
            productRepository.restoreStock(lineItem.getProduct().getId(), lineItem.getQuantity());
            lineItem.setOrder(null);
        }
        lineItemRepository.saveAll(lineItems);
    }

    @Override
    public List<OrderResponse> myOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return orderRepository.getByUserIdAndIsActiveTrue(user.getId()).stream()
                .map(orderMapper::convertToResponse)
                .toList();
    }

    @Override
    public OrderResponse getById(long orderId) {
        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() -> new NotFoundException("Order cannot found with id: " + orderId));
        return orderMapper.convertToResponse(order);
    }

    @Override
    public List<OrderResponse> getAllStatus_NotDelete() {
        return orderRepository.getAllNotDeleted().stream().map(orderMapper::convertToResponse).toList();
    }

    @Override
    public List<OrderResponse> getAllCancelRequest() {
        return orderRepository.getByStatusCanceledRequest().stream()
                .map(orderMapper::convertToResponse)
                .toList();
    }

    private void checkBeforeCreateOrder(long userId, String lineItemIds) {

        // 1. (for CARD) check xem user nay co dang thanh toan don hang nao khong
        // (mot user chi thanh toan duoc 1 Order by cung luc)
        List<Order> processingOrders = orderRepository.findPayByCardByUserIdAndStatusPending(userId);
        if (!processingOrders.isEmpty()) {
            throw new CustomException(
                    "Current user is processing other Order! Please try again in 5 minutes later.", 409);
        }

        // 2. check co cart khong
        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            throw new NotFoundException("Cart not found with userId " + userId);
        }

        // 3. check lineItems co trong cart khong
        List<LineItem> lineItems = getLineItemsByIds(lineItemIds);
        for (LineItem lineItem : lineItems) {
            if (!cart.getLineItems().contains(lineItem)) {
                throw new CustomException("Line item is not in cart!", 404);
            }
            // 4. check san pham con khong
            if (lineItem.getQuantity() > lineItem.getProduct().getQuantity()) {
                String mesaage =
                        lineItem.getProduct().getName() + " does not have enough quantity in stock!";
                throw new CustomException(mesaage, 400);
            }
        }
    }

    public double getAmountFromListLineItem(String listLineItems) {
        List<LineItem> lineItems = getLineItemsByIds(listLineItems);
        return lineItems.stream().mapToDouble(LineItem::getPrice).sum();
    }

    private List<LineItem> getLineItemsByIds(String listLineItems) {
        List<Integer> lineItemIds =
                Arrays.stream(listLineItems.split(",")).map(Integer::parseInt).toList();

        List<LineItem> lineItems = new ArrayList<>();
        for (Integer lineItemId : lineItemIds) {
            LineItem lineItem = lineItemRepository.findByIdAndIsActiveTrueAndIsDeletedFalse(lineItemId);
            if (lineItem == null) {
                throw new NotFoundException("Line item cannot be found with id: " + lineItemId);
            }
            lineItems.add(lineItem);
        }
        return lineItems;
    }

    @Override
    public OrderResponse markOrderAsReviewed(long orderId) {
      Order order = orderRepository.findById(orderId)
              .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
      order.setHasReview(true);
      orderRepository.save(order);
      return orderMapper.convertToResponse(order);
    }
    @Override
    public boolean checkHasReview(long orderId) {
      Order order = orderRepository.findById(orderId)
              .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));
      return order.isHasReview();
    }

}
