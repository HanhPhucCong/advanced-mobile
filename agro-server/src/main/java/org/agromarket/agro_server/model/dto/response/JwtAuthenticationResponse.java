package org.agromarket.agro_server.model.dto.response;

import lombok.Data;
import org.agromarket.agro_server.common.Role;

@Data
public class JwtAuthenticationResponse {
    private String token;
    private String refreshToken;
    private Role role;
}
