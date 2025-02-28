package org.agromarket.agro_server.model.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {
  @NotBlank(message = "Full name must not be null or blank!")
  @Size(max = 50, message = "Full name must not exceed 50 characters!")
  private String fullName;

  @NotBlank(message = "Phone number must not be null or blank!")
  @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits!")
  private String phoneNumber;

  @NotBlank(message = "Address must not be null or blank!")
  @Size(max = 255, message = "Address must not exceed 255 characters!")
  private String address;

  @NotNull(message = "Date of birth must not be null!")
  @Past(message = "Date of birth must be in the past!")
  private LocalDateTime dateOfBirth;

  private String avatarUrl;
}
