package org.agromarket.agro_server.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {
    @NotNull(message = "Coin amount must not be null!")
    @Min(value = 1000, message = "Minimum coin amount is 1000!")
    @Max(value = 10000, message = "Maximum coin amount is 10000!")
    private Integer coinAmount; // số xu cần đổi (1.000-10.000, bội số 1000)
}


