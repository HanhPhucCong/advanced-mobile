package org.agromarket.agro_server.util.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class VNPayUtil {

  public static String hmacSHA512(final String key, final String data) {
    try {

      if (key == null || data == null) {
        throw new NullPointerException();
      }
      final Mac hmac512 = Mac.getInstance("HmacSHA512");
      byte[] hmacKeyBytes = key.getBytes();
      final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
      hmac512.init(secretKey);
      byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
      byte[] result = hmac512.doFinal(dataBytes);
      StringBuilder sb = new StringBuilder(2 * result.length);
      for (byte b : result) {
        sb.append(String.format("%02x", b & 0xff));
      }
      return sb.toString();

    } catch (Exception ex) {
      return "";
    }
  }

  public static String getIpAddress(HttpServletRequest request) {
    String ipAdress;
    try {
      ipAdress = request.getHeader("X-FORWARDED-FOR");
      if (ipAdress == null) {
        ipAdress = request.getRemoteAddr();
      }
    } catch (Exception e) {
      ipAdress = "Invalid IP:" + e.getMessage();
    }
    return ipAdress;
  }

  public static String getRandomNumber(int len) {
    Random rnd = new Random();
    String chars = "0123456789";
    StringBuilder sb = new StringBuilder(len);
    for (int i = 0; i < len; i++) {
      sb.append(chars.charAt(rnd.nextInt(chars.length())));
    }
    return sb.toString();
  }

  public static boolean validateSignature(
      Map<String, String> vnp_Params, String secretKey, String vnp_SecureHash) {
    // Sắp xếp tham số theo thứ tự alphabet để tính mã 1 cách đồng nhất (bỏ qua vnp_SecureHash)
    List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
    Collections.sort(fieldNames);

    StringBuilder hashData = new StringBuilder();
    for (String fieldName : fieldNames) {
      String fieldValue = vnp_Params.get(fieldName);
      if (fieldValue != null && !fieldValue.isEmpty()) {
        // key=value&
        hashData.append(URLDecoder.decode(fieldName, StandardCharsets.UTF_8));
        hashData.append('=');
        hashData.append(URLDecoder.decode(fieldValue, StandardCharsets.UTF_8));
        hashData.append('&');
      }
    }

    if (hashData.length() > 0) {
      hashData.setLength(hashData.length() - 1); // Xóa ký tự & cuối cùng
    }

    // Tính toán HMAC SHA512
    String calculatedHash = hmacSHA512(secretKey, hashData.toString());

    // So sánh hash tính toán với hash từ VNPay
    return calculatedHash.equalsIgnoreCase(vnp_SecureHash);
  }
}
