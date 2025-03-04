package org.agromarket.agro_server.controller.customer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.exception.CustomException;
import org.agromarket.agro_server.model.dto.request.CheckoutRequest;
import org.agromarket.agro_server.service.customer.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

  private final PaymentService paymentService;

  // thanh toan ONLINE (VNPay)
  @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
  @PostMapping("/payment/create-payment")
  public ResponseEntity<?> createPayment(
      HttpServletRequest request, @RequestBody @Valid CheckoutRequest checkoutRequest) {
    return ResponseEntity.ok(paymentService.createPayment(request, checkoutRequest));
  }

  // chưa có FE nên để /auth để không bị lỗi khi test bằng BE (vì trình duyêt khác nên ko có token)
  @GetMapping("/v1/auth/payment/vnpay-callback")
  public ResponseEntity<?> transaction(
      HttpServletResponse response,
      @RequestParam(value = "vnp_Amount") String amount,
      @RequestParam(value = "vnp_BankCode") String bankCode,
      @RequestParam(value = "vnp_OrderInfo") String orderInfo,
      @RequestParam(value = "vnp_ResponseCode") String responseCode)
      throws IOException {

    if (responseCode.equals("00")) {
      paymentService.handlePaymentSuccess(orderInfo);
    } else {
      log.error("Payment with vnpay failed!");
      throw new CustomException("Payment failed", HttpStatus.BAD_REQUEST.value());
    }
    return ResponseEntity.ok(new BaseResponse("Payment successfully!", HttpStatus.OK.value(), ""));
  }
}
