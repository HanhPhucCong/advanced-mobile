package org.agromarket.agro_server.controller.customer;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.model.dto.request.CheckoutRequest;
import org.agromarket.agro_server.service.customer.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/checkout-by-cod")
    public ResponseEntity<BaseResponse> checkoutByCash(
            @Valid @RequestBody CheckoutRequest checkoutRequest) {
        return ResponseEntity.ok(
                new BaseResponse(
                        "Create Order successfully, please wait for confirm!",
                        200,
                        orderService.checkoutByCOD(checkoutRequest)));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/confirm-cod/{orderId}")
    public ResponseEntity<BaseResponse> confirmCODOrder(@PathVariable("orderId") long orderId) {
        return ResponseEntity.ok(
                new BaseResponse(
                        "Confirm order successfully!", 200, orderService.confirmCODOrder(orderId)));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<BaseResponse> cancelOrder(@PathVariable("orderId") long orderId) {
        return orderService.cancelOrder(orderId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/approve-cancel-request/{orderId}")
    public ResponseEntity<BaseResponse> approveCancelRequest(@PathVariable("orderId") long orderId) {
        boolean isAprroved = true;
        return ResponseEntity.ok(
                new BaseResponse(
                        "Approved cancel request sucessfully!",
                        200,
                        orderService.handleCancelRequest(orderId, isAprroved)));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/reject-cancel-request/{orderId}")
    public ResponseEntity<BaseResponse> rejectCancelRequest(@PathVariable("orderId") long orderId) {
        boolean isAprroved = false;
        return ResponseEntity.ok(
                new BaseResponse(
                        "Rejected cancel request sucessfully!",
                        200,
                        orderService.handleCancelRequest(orderId, isAprroved)));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/my-orders")
    public ResponseEntity<BaseResponse> myOrders() {
        return ResponseEntity.ok(
                new BaseResponse("Get my orders successfully!", 200, orderService.myOrders()));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/{orderId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("orderId") long orderId) {
        return ResponseEntity.ok(
                new BaseResponse("Get order by id successfully!", 200, orderService.getById(orderId)));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/all-status")
    public ResponseEntity<BaseResponse> getAllNotDeleted() {
        return ResponseEntity.ok(
                new BaseResponse(
                        "Get all order (not deleted) successfully!",
                        200,
                        orderService.getAllStatus_NotDelete()));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/cancel-request")
    public ResponseEntity<BaseResponse> getAllCancelRequests() {
        return ResponseEntity.ok(
                new BaseResponse(
                        "Get all orders with cancel request successfully!",
                        200,
                        orderService.getAllCancelRequest()));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/mark-reviewed/{orderId}")
    public ResponseEntity<BaseResponse> markOrderAsReviewed(@PathVariable("orderId") long orderId) {
        return ResponseEntity.ok(
                new BaseResponse("Order marked as reviewed successfully!", 200, orderService.markOrderAsReviewed(orderId))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/check-review/{orderId}")
    public ResponseEntity<BaseResponse> checkOrderReviewStatus(@PathVariable("orderId") long orderId) {
        boolean hasReview = orderService.checkHasReview(orderId);
        return ResponseEntity.ok(new BaseResponse("Review status retrieved successfully!", 200, hasReview));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/restore/{orderId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("orderId") long orderId) {
        orderService.restore(orderId);
        return ResponseEntity.ok(new BaseResponse("Restore successfully", 200, null));
    }
}
