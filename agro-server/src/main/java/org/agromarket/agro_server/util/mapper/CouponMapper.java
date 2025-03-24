package org.agromarket.agro_server.util.mapper;

import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.model.dto.response.CouponResponse;
import org.agromarket.agro_server.model.entity.Coupon;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CouponMapper {

    private final ModelMapper mapper;

    public CouponResponse convertToResponse(Coupon coupon) {
        CouponResponse response = mapper.map(coupon, CouponResponse.class);
        response.setUserId(coupon.getUser().getId());
        return response;
    }
}
