package org.agromarket.agro_server.controller.customer;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.model.dto.request.CouponRequest;
import org.agromarket.agro_server.service.customer.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupon")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> createCoupon(@RequestBody @Valid CouponRequest couponRequest) {
        return ResponseEntity.ok(
                new BaseResponse(
                        "Create coupon successfully!",
                        200,
                        couponService.createCoupon(couponRequest)));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/my-coupons")
    public ResponseEntity<BaseResponse> myCoupons() {
        return ResponseEntity.ok(
                new BaseResponse(
                        "Get my coupons successfully!",
                        200,
                        couponService.myCoupons()));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse> getCouponById(@PathVariable("id") long id) {
        return ResponseEntity.ok(
                new BaseResponse(
                        "Get coupon by id successfully!",
                        200,
                        couponService.getCouponById(id)));
    }

}
