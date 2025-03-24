package org.agromarket.agro_server.repositories.customer;

import org.agromarket.agro_server.model.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    boolean existsByCode(String code);

    List<Coupon> findAllByUserId(Long userId);

    @Query("SELECT c FROM Coupon c WHERE c.user.id = :userId " +
            "AND c.expirationDate > :now " +
            "AND c.isActive = true " +
            "AND c.isDeleted = false")
    List<Coupon> findAllByUserIdAndExpirationDateAfter(@Param("userId") Long userId,
                                                       @Param("now") LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.code = :code " +
            "AND c.user.id = :userId " +
            "AND c.expirationDate > :now " +
            "AND c.isActive = true " +
            "AND c.isDeleted = false")
    Optional<Coupon> findValidCoupon(@Param("code") String code,
                                     @Param("userId") Long userId,
                                     @Param("now") LocalDateTime now);

}
