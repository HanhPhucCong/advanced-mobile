package org.agromarket.agro_server.model.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.agromarket.agro_server.common.OrderStatus;
import org.agromarket.agro_server.common.PaymentMethod;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class OrderResponse extends BaseResponseDTO {
  private long userId;
  private List<LineItemReponse> lineItems;
  private String shippingAddress;
  private String note;
  private double totalAmount;
  private OrderStatus status;
  private PaymentMethod paymentMethod;
  private LocalDateTime paymentDate;
}
