package org.agromarket.agro_server.model.dto.response;

import lombok.*;
import org.agromarket.agro_server.common.Role;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class UserResponse extends BaseResponseDTO {
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private LocalDateTime dateOfBirth;
    private String avatarUrl;
    private Role role;
    private Boolean isEmailVerified;
    private int coin;
}
