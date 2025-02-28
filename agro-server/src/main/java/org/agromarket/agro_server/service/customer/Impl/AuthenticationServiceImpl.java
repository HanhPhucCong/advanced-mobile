package org.agromarket.agro_server.service.customer.Impl;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.common.Role;
import org.agromarket.agro_server.config.AppConfiguration;
import org.agromarket.agro_server.exception.CustomException;
import org.agromarket.agro_server.exception.NotFoundException;
import org.agromarket.agro_server.model.dto.request.*;
import org.agromarket.agro_server.model.dto.response.JwtAuthenticationResponse;
import org.agromarket.agro_server.model.dto.response.UserResponse;
import org.agromarket.agro_server.model.dto.response.VerifyResponse;
import org.agromarket.agro_server.model.entity.BlackListRefreshToken;
import org.agromarket.agro_server.model.entity.BlackListToken;
import org.agromarket.agro_server.model.entity.User;
import org.agromarket.agro_server.model.entity.Verify;
import org.agromarket.agro_server.repositories.customer.BlackListRefreshTokenRepository;
import org.agromarket.agro_server.repositories.customer.BlackListTokenRepository;
import org.agromarket.agro_server.repositories.customer.UserRepository;
import org.agromarket.agro_server.repositories.customer.VerifyRepository;
import org.agromarket.agro_server.service.customer.AuthenticationService;
import org.agromarket.agro_server.service.customer.JwtService;
import org.agromarket.agro_server.service.customer.MailService;
import org.agromarket.agro_server.service.customer.UserService;
import org.agromarket.agro_server.util.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final AppConfiguration appConfig;
  private final MailService mailService;
  private final UserMapper userMapper;
  private final UserService userService;
  private final VerifyRepository verifyRepository;
  private final BlackListRefreshTokenRepository blackListRefreshTokenRepository;
  private final BlackListTokenRepository blackListTokenRepository;

  private boolean checkMatchPassword(String password, String passwordConfirm) {
    if (!password.equals(passwordConfirm)) {
      log.warn("Password and confirm password are not matched!");
      return false;
    }
    return true;
  }

  private String getVerifyCode() {
    StringBuilder verifyCode = new StringBuilder();
    Random random = new Random();
    for (int i = 0; i < 6; i++) {
      verifyCode.append(random.nextInt(10));
    }
    return verifyCode.toString();
  }

  @Override
  public void autoCreateAdminAccount() {
    User adminAccount = userRepository.findByRole(Role.ADMIN);
    if (adminAccount == null) {
      User user = new User();
      user.setFullName("admin");
      user.setEmail("admin@gmail.com");
      user.setRole(Role.ADMIN);
      user.setPassword(new BCryptPasswordEncoder().encode("admin"));
      user.setIsEmailVerified(true);

      userRepository.save(user);
    }
  }

  // Đăng ký bước 1
  @Transactional(rollbackFor = Exception.class)
  @Override
  public VerifyResponse signup(SignupRequest signupRequest) {
    // kiểm tra xem email đã tồn tại chưa
    if (userRepository.existsByEmail(signupRequest.getEmail())) {
      throw new CustomException(
          "Existed Email! Please enter another email", HttpStatus.BAD_REQUEST.value());
    }

    // check mật khẩu và xác nhận mật khẩu
    if (!checkMatchPassword(signupRequest.getPassword(), signupRequest.getPasswordConfirm())) {
      throw new CustomException(
          "Password and confirm password do not match!", HttpStatus.BAD_REQUEST.value());
    }

    User user = new User();
    user.setFullName(signupRequest.getFullName());
    user.setEmail(signupRequest.getEmail());
    user.setRole(Role.CUSTOMER);
    user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
    user.setAvatarUrl(
        "https://res.cloudinary.com/dftznqjsj/image/upload/v1729934084/round-account-button-with-user-inside_ehcrfp.png");

    String verifyCode = getVerifyCode();
    Verify verify = new Verify();
    verify.setCode(BCrypt.hashpw(verifyCode, BCrypt.gensalt(appConfig.getLogRounds())));
    verify.setExpireAt(
        ZonedDateTime.now().plusMinutes(appConfig.getVerifyExpireTime()).toLocalDateTime());
    verify.setUser(user);
    verify.setIsRevoked(false);

    // gửi otp qua mail:
    try {
      mailService.sendMailVerify(
          signupRequest.getEmail(), signupRequest.getFullName(), verifyCode, "VerifyTemplate");

    } catch (Exception e) {
      log.error("Lỗi khi gửi email xác thực cho người dùng: " + user.getEmail(), e);
      throw new RuntimeException("Error sending verification email. Please try again later.", e);
    }

    user.setVerify(verify);
    userRepository.save(user);

    log.info("Create new User succesfully! UserId: " + user.getId());

    return VerifyResponse.builder().id(user.getId()).expiredAt(verify.getExpireAt()).build();
  }

  // Đăng ký bước 2 (Kiểm tra OTP)
  @Override
  public UserResponse verifyUser(long userId, VerifyRequest verifyRequest) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new NotFoundException("Your account does not exist."));

    // kiểm tra xem có mã xác thực không
    if (user.getVerify() == null) {
      throw new NotFoundException("The verification code does not exist.");
    }

    // kiểm tra xem tài khoản đã đươc xác thực trước đó chưa
    if (user.getIsEmailVerified()) {
      throw new CustomException(
          "This account has already been verified.", HttpStatus.BAD_REQUEST.value());
    }

    // kiểm tra mã xác thực hết hạn chưa
    if (user.getVerify().getExpireAt().isBefore(LocalDateTime.now())) {
      log.error("Verify code is expired: " + user.getEmail());
      user.setVerify(null); // Xóa mã xác thực đã hết hạn
      userRepository.save(user);
      throw new CustomException(
          "The verification code has expired!", HttpStatus.UNAUTHORIZED.value());
    }

    // check code
    if (!BCrypt.checkpw(verifyRequest.getCode(), user.getVerify().getCode())) {
      log.error("Verify code is incorrect: " + user.getEmail());
      throw new CustomException(
          "The verification code is incorrect.", HttpStatus.UNAUTHORIZED.value());
    }

    // pass, đánh dấu tài khoản là đã được xác thực
    user.setIsEmailVerified(true);
    user.setVerify(null);
    userRepository.save(user);

    log.info("Verify User succesfully! UserId: " + user.getId());

    return userMapper.convertToResponse(user);
  }

  @Override
  public JwtAuthenticationResponse signin(SigninRequest signinRequest) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            signinRequest.getEmail(), signinRequest.getPassword()));

    var user =
        userRepository
            .findByEmail(signinRequest.getEmail())
            .orElseThrow(
                () ->
                    new CustomException(
                        "Invalid email or password!", HttpStatus.BAD_REQUEST.value()));
    var jwt = jwtService.generateToken(user);
    var refreshToken = jwtService.generateRefreshToken(new HashMap<>(), user);

    JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse();
    jwtAuthenticationResponse.setToken(jwt);
    jwtAuthenticationResponse.setRefreshToken(refreshToken);

    return jwtAuthenticationResponse;
  }

  @Override
  public JwtAuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
    // check xem refreshToken này còn dùng được ko
    String refreshToken = refreshTokenRequest.getToken();
    BlackListRefreshToken blackListRefreshToken =
        blackListRefreshTokenRepository.getByToken(refreshToken);
    if (blackListRefreshToken != null && blackListRefreshToken.isRevoked()) {
      log.error("Refresh token failed, refreshToken revoked!");
      throw new CustomException("Refresh token has been revoked", HttpStatus.BAD_REQUEST.value());
    }

    String userEmail = jwtService.extractUserName(refreshToken);
    User user = userRepository.findByEmail(userEmail).orElseThrow();
    if (jwtService.isTokenValid(refreshToken, user)) {
      var jwt = jwtService.generateToken(user);

      JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse();
      jwtAuthenticationResponse.setToken(jwt);
      jwtAuthenticationResponse.setRefreshToken(refreshToken);

      log.info("REFRESH TOKEN SUCCESSFULLY! {}", LocalDateTime.now());
      return jwtAuthenticationResponse;
    }
    log.error("REFRESH TOKEN FAILED");
    return null;
  }

  @Transactional
  @Override
  public ResponseEntity<BaseResponse> sendVerifyRequest(
      ForgotPasswordRequest forgotPasswordRequest) {
    User user = userService.getUserByEmail(forgotPasswordRequest.getEmail());
    if (user == null) {
      throw new CustomException("No user found with this email!", HttpStatus.NOT_FOUND.value());
    }

    // Kiểm tra xem user này có email được xác thực chưa
    boolean isVerified = user.getIsEmailVerified();
    String message;
    if (isVerified) {
      message = "The password recovery code has been sent to the email: " + user.getEmail();
    } else {
      message = "The verification code has been sent to the email: " + user.getEmail();
    }

    // Tạo mã xác thực
    String verifyCode = getVerifyCode();
    Verify existingVerify = user.getVerify();

    if (existingVerify != null) {
      // Nếu đã có Verify liên kết với User, cập nhật lại thông tin
      existingVerify.setCode(BCrypt.hashpw(verifyCode, BCrypt.gensalt(appConfig.getLogRounds())));
      existingVerify.setExpireAt(
          ZonedDateTime.now().plusMinutes(appConfig.getVerifyExpireTime()).toLocalDateTime());
      existingVerify.setIsRevoked(false);
      verifyRepository.save(existingVerify);
    } else {
      // Nếu chưa có Verify, tạo mới Verify
      Verify newVerify = new Verify();
      newVerify.setCode(BCrypt.hashpw(verifyCode, BCrypt.gensalt(appConfig.getLogRounds())));
      newVerify.setExpireAt(
          ZonedDateTime.now().plusMinutes(appConfig.getVerifyExpireTime()).toLocalDateTime());
      newVerify.setIsRevoked(false);
      newVerify.setUser(user);
      verifyRepository.save(newVerify);
      user.setVerify(newVerify);
    }

    // Gửi OTP qua email
    try {
      mailService.sendPasswordRecoveryMail(
          user.getEmail(), user.getFullName(), verifyCode, "ForgotPwRequestTemplate");
    } catch (Exception e) {
      log.error("Error when sending verification email to user: " + user.getEmail(), e);
      throw new RuntimeException("Error sending verification email. Please try again later.", e);
    }

    userRepository.save(user);

    VerifyResponse verifyResponse = null;
    if (user.getVerify() != null) {
      verifyResponse =
          VerifyResponse.builder()
              .id(user.getId())
              .expiredAt(user.getVerify().getExpireAt())
              .build();
    }

    log.info("Send verify request successfully! UserId: " + user.getId());

    return ResponseEntity.status(HttpStatus.OK)
        .body(new BaseResponse(message, HttpStatus.OK.value(), verifyResponse));
  }

  @Override
  public UserResponse renewPassword(long userId, RenewPasswordRequest renewPasswordRequest) {
    User user =
        userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found."));

    // kiểm tra xem có mã xác thực không
    if (user.getVerify() == null) {
      throw new NotFoundException("The verification code does not exist.");
    }

    // kiểm tra mã xác thực hết hạn chưa
    if (user.getVerify().getExpireAt().isBefore(LocalDateTime.now())) {
      log.error("Verify code is expired: " + user.getEmail());
      user.setVerify(null); // Xóa mã xác thực đã hết hạn
      userRepository.save(user);
      throw new CustomException(
          "The verification code has expired!", HttpStatus.UNAUTHORIZED.value());
    }

    // check mã khôi phục
    if (!BCrypt.checkpw(renewPasswordRequest.getResetPasswordCode(), user.getVerify().getCode())) {
      log.warn(" code: " + renewPasswordRequest.getResetPasswordCode());
      log.warn("user code: " + user.getVerify().getCode());

      log.error("Verify code is incorrect: " + user.getEmail());
      throw new CustomException(
          "The verification code is incorrect.", HttpStatus.BAD_REQUEST.value());
    }

    // check mật khẩu và xác nhận mật khẩu
    if (!checkMatchPassword(
        renewPasswordRequest.getPassword(), renewPasswordRequest.getComfirmPassword())) {
      throw new IllegalArgumentException("Password and confirmation password do not match.");
    }

    // pass, tạo mật khẩu mới
    user.setPassword(passwordEncoder.encode(renewPasswordRequest.getPassword()));
    user.setVerify(null);
    user.setIsEmailVerified(true);
    userRepository.save(user);

    log.info("Change password succesfully! UserId: " + user.getId());

    return userMapper.convertToResponse(user);
  }

  @Override
  public void signout(SignoutRequest signoutRequest) {
    BlackListToken blackListToken = new BlackListToken(signoutRequest.getToken(), true);
    blackListTokenRepository.save(blackListToken);

    BlackListRefreshToken blackListRefreshToken =
        new BlackListRefreshToken(signoutRequest.getRefreshToken(), true);
    blackListRefreshTokenRepository.save(blackListRefreshToken);
  }
}
