package org.agromarket.agro_server.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.agromarket.agro_server.common.CouponType;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class CouponResponse extends BaseResponseDTO {
    private String code;
    private LocalDateTime expirationDate;
    private Double minimumOrderAmount;
    private CouponType type;
    private Double discountValue;
    private long userId;
}
