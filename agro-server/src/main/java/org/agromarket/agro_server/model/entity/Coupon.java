package org.agromarket.agro_server.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.agromarket.agro_server.common.CouponType;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Coupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expirationDate;   // ngày hết hạn

    private Double minimumOrderAmount = 0.0;      // giá trị đơn hàng tối thiếu

    @Enumerated(EnumType.STRING)
    private CouponType type;                // loại mã giảm giá (phần trăm)

    @Column(nullable = false)
    private Double discountValue;           // giá trị giảm giá (%)

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
