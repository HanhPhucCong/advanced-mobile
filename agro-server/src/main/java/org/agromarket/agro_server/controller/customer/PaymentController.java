package org.agromarket.agro_server.controller.customer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.agromarket.agro_server.config.vnpay.VNPayConfig;
import org.agromarket.agro_server.model.dto.request.CheckoutRequest;
import org.agromarket.agro_server.service.customer.PaymentService;
import org.agromarket.agro_server.util.vnpay.VNPayUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

  private final PaymentService paymentService;
  private final VNPayConfig vnPayConfig;

  // thanh toan ONLINE (VNPay)
  @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
  @PostMapping("/payment/create-payment")
  public ResponseEntity<?> createPayment(
      HttpServletRequest request, @RequestBody @Valid CheckoutRequest checkoutRequest) {
    return ResponseEntity.ok(paymentService.createPayment(request, checkoutRequest));
  }

  // auth: api bên thu 3 nen ko can xac thuc, check secret_key la ok roi
  @GetMapping("/v1/auth/payment/vnpay-callback")
  public void transaction(HttpServletRequest request, HttpServletResponse response)
      throws IOException {

    String redirectUrl;

    try {
      // lay toan bo request params tu request
      Map<String, String> vnp_Params = new HashMap<>();
      for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
        vnp_Params.put(entry.getKey(), entry.getValue()[0]);
      }

      String vnp_SecureHash = vnp_Params.remove("vnp_SecureHash");

      // check key
      if (!VNPayUtil.validateSignature(vnp_Params, vnPayConfig.getSecretKey(), vnp_SecureHash)) {
        log.error("Invalid vnp_SecureHash! Possible fraud attempt.");
        String errorMsg = URLEncoder.encode("Invalid signature", StandardCharsets.UTF_8);
        redirectUrl = "myapp://payment-failed?error=" + errorMsg;
      } else {
        String responseCode = vnp_Params.get("vnp_ResponseCode");
        String orderInfo = vnp_Params.get("vnp_OrderInfo");

        if ("00".equals(responseCode)) {
          paymentService.handlePaymentSuccess(orderInfo);
          redirectUrl = "myapp://payment-success";
        } else {
          log.error("Payment failed! Response code: {}", responseCode);
          String errorMsg =
              URLEncoder.encode(
                  "Pay with VNPay failed, error code: " + responseCode, StandardCharsets.UTF_8);
          redirectUrl = "myapp://payment-failed?error=" + errorMsg;
        }
      }
    } catch (Exception e) {
      log.error("Error processing VNPay callback: {}", e.getMessage(), e);
      String errorMsg = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
      redirectUrl = "myapp://payment-failed?error=" + errorMsg;
    }

    response.sendRedirect(redirectUrl);
  }
}
