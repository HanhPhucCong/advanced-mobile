package org.agromarket.agro_server.service.customer.Impl;

import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.common.CouponType;
import org.agromarket.agro_server.common.Role;
import org.agromarket.agro_server.exception.CustomException;
import org.agromarket.agro_server.exception.NotFoundException;
import org.agromarket.agro_server.model.dto.request.CouponRequest;
import org.agromarket.agro_server.model.dto.response.CouponResponse;
import org.agromarket.agro_server.model.entity.Coupon;
import org.agromarket.agro_server.model.entity.User;
import org.agromarket.agro_server.repositories.customer.CouponRepository;
import org.agromarket.agro_server.repositories.customer.UserRepository;
import org.agromarket.agro_server.service.customer.CouponService;
import org.agromarket.agro_server.util.mapper.CouponMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;
    private final UserRepository userRepository;

    // đổi mã giảm giá từ xu (1000-10000, bội số 1000)
    @Override
    @Transactional
    public CouponResponse createCoupon(CouponRequest couponRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        int coinAmount = couponRequest.getCoinAmount();

        // Check số xu hợp lệ ((1.000-10.000, bội số 1000)
        if (coinAmount < 1000 || coinAmount > 10000 || coinAmount % 1000 != 0) {
            throw new CustomException("Coin amount must be a multiple of 1000, between 1000 and 10000!", 400);
        }

        // Check xu có đủ không
        if (user.getCoin() < coinAmount) {
            throw new CustomException("You don't have enough coins!", 400);
        }

        // Tính toán giá trị giảm giá và đơn hàng tối thiểu
        double discountValue = coinAmount / 100.0;  // 1000 xu → 10%, 5000 xu → 50%, ...
        double minimumOrderAmount = discountValue * 10_000;  // 10% → 100k, 50% → 500k

        // Tạo mã giảm giá
        String code;
        int attempt = 0;
        do {
            code = generateRandomString(6);
            if (attempt++ > 10) {
                throw new CustomException("Failed to generate unique coupon code. Please try again!", 400);
            }
        } while (couponRepository.existsByCode(code));

        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setExpirationDate(LocalDateTime.now().plusMonths(6));
        coupon.setMinimumOrderAmount(minimumOrderAmount);
        coupon.setType(CouponType.PERCENTAGE);
        coupon.setDiscountValue(discountValue);
        coupon.setUser(user);
        coupon = couponRepository.save(coupon);

        // Trừ xu
        user.setCoin(user.getCoin() - coinAmount);
        userRepository.save(user);

        return couponMapper.convertToResponse(coupon);
    }

    public String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length());
            sb.append(characters.charAt(index));
        }

        return sb.toString();
    }

    // lấy toàn bộ coupons còn hạn
    @Override
    public List<CouponResponse> myCoupons() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        List<Coupon> coupons = couponRepository
                .findAllByUserIdAndExpirationDateAfter(user.getId(), LocalDateTime.now());
        return coupons.stream().map(couponMapper::convertToResponse).toList();
    }

    @Override
    public CouponResponse getCouponById(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found!"));

        if (!(user.getRole().equals(Role.ADMIN)) && coupon.getUser().getId() != (user.getId())) {
            throw new CustomException("You don't have permission to access this coupon!", 403);
        }

        return couponMapper.convertToResponse(coupon);
    }

    // áp mã giảm giá (không check)
    @Override
    public double applyCoupon(Coupon coupon, double totalAmount) {
        if (coupon == null) {
            return totalAmount; // Không có mã giảm giá
        }

        // Tính số tiền giảm giá
        double discount = (coupon.getDiscountValue() / 100) * totalAmount;

        // Đảm bảo số tiền không bị âm
        double finalAmount = totalAmount - discount;

        coupon.setIsActive(false);
        couponRepository.save(coupon);

        return Math.max(finalAmount, 0);
    }

    // check mã giảm giá hợp lệ
    @Override
    public Coupon getValidCoupon(String couponCode, Long userId, double totalAmount) {
        Coupon coupon = couponRepository.findValidCoupon(couponCode, userId, LocalDateTime.now())
                .orElseThrow(() -> new CustomException("Invalid or expired coupon!", 400));

        if (totalAmount < coupon.getMinimumOrderAmount()) {
            throw new CustomException("Order amount is too low to use this coupon!", 400);
        }

        return coupon;
    }

}
