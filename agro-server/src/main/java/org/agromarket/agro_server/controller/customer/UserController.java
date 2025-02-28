package org.agromarket.agro_server.controller.customer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.model.dto.request.ProfileRequest;
import org.agromarket.agro_server.model.dto.response.CloudinaryResponse;
import org.agromarket.agro_server.service.customer.CloudinaryService;
import org.agromarket.agro_server.service.customer.UserService;
import org.agromarket.agro_server.util.file.FileUploadUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;
  private final CloudinaryService cloudinaryService;
  private final ObjectMapper objectMapper;

  @PutMapping("/update-profile")
  public ResponseEntity<BaseResponse> updateCurrentUser(
      @RequestPart("profileRequest") String profileRequestJson,
      @RequestPart(name = "file", required = false) MultipartFile file) {

    try {
      // chuyển JSON từ String sang object
      ProfileRequest profileRequest =
          objectMapper.readValue(profileRequestJson, ProfileRequest.class);

      if (file != null && !file.isEmpty()) {
        FileUploadUtil.assertAllowedImage(file);
        final String fileName = FileUploadUtil.getFileName(file.getOriginalFilename());
        final CloudinaryResponse response = cloudinaryService.uploadFile(file, fileName);
        profileRequest.setAvatarUrl(response.getUrl());
      }

      return userService.updateInfo(profileRequest);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(new BaseResponse("Invalid profileRequest format!", 400, null));
    }
  }

  @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
  @GetMapping("/my-profile")
  public ResponseEntity<BaseResponse> getCurrentProfile() {
    return userService.getCurrentProfile();
  }
}
