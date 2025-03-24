package org.agromarket.agro_server.service.customer;

import org.agromarket.agro_server.model.dto.request.CouponRequest;
import org.agromarket.agro_server.model.dto.response.CouponResponse;
import org.agromarket.agro_server.model.entity.Coupon;

import java.util.List;

public interface CouponService {

    // đổi mã giảm giá từ xu (1000-10000, bội số 1000)
    CouponResponse createCoupon(CouponRequest couponRequest);

    List<CouponResponse> myCoupons();

    CouponResponse getCouponById(Long id);

    double applyCoupon(Coupon coupon, double totalAmount);

    Coupon getValidCoupon(String couponCode, Long userId, double totalAmount);

}
