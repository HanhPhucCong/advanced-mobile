package org.agromarket.agro_server.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {
  @NotBlank(message = "List line items must be not null!")
  private String lineItemIds;

  @NotBlank(message = "Shipping address must be not null!")
  @Size(min = 0, max = 255, message = "Shipping address must be between 0 to 255 characters!")
  private String shippingAddress;

  private String note;
}

/*
* {
  "lineItemIds": [1,3,5],
  "shippingAddress": "123 Đường ABC, TP.HCM",
  "note": "Giao hàng trong giờ hành chính"
}
* */
