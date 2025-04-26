package org.agromarket.agro_server.service.customer;

import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.model.dto.request.CheckoutRequest;
import org.agromarket.agro_server.model.dto.response.OrderResponse;
import org.agromarket.agro_server.model.entity.LineItem;
import org.agromarket.agro_server.model.entity.Order;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface OrderService {

    // checkout by COD (step 1: customer order)
    public OrderResponse checkoutByCOD(CheckoutRequest checkoutRequest);

    // checkout by COD (step 2: admin CONFIRM)
    public OrderResponse confirmCODOrder(long orderId);

    // checkout by ONLINE (step 1: create temporary Order)
    public OrderResponse makeOrder(long userId, CheckoutRequest checkoutRequest);

    // checkout by ONLINE (step 2: confirm Order)
    public OrderResponse confirmOrder(Order order);

    public ResponseEntity<BaseResponse> cancelOrder(long orderId);

    public OrderResponse handleCancelRequest(long orderId, boolean isApproved);

    public void restock(List<LineItem> lineItems);

    public List<OrderResponse> myOrders();

    public OrderResponse getById(long orderId);

    public List<OrderResponse> getAllStatus_NotDelete();

    public List<OrderResponse> getAllCancelRequest();

    public OrderResponse markOrderAsReviewed(long orderId);

    public boolean checkHasReview(long orderId);

    public OrderResponse restore(long orderId);
}
