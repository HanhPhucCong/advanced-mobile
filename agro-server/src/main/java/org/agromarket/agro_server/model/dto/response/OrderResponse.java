package org.agromarket.agro_server.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.agromarket.agro_server.common.OrderStatus;
import org.agromarket.agro_server.common.PaymentMethod;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class OrderResponse extends BaseResponseDTO {
    private long userId;
    private List<LineItemReponse> lineItems;
    private String shippingAddress;
    private String note;
    private String phoneNumber;
    private double totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private LocalDateTime paymentDate;
    private CouponResponse coupon;
}
