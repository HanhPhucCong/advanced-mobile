package org.agromarket.agro_server.service.customer.Impl;

import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.common.BaseResponse;
import org.agromarket.agro_server.exception.NotFoundException;
import org.agromarket.agro_server.model.dto.request.ProfileRequest;
import org.agromarket.agro_server.model.dto.response.UserResponse;
import org.agromarket.agro_server.model.entity.User;
import org.agromarket.agro_server.repositories.customer.UserRepository;
import org.agromarket.agro_server.service.customer.UserService;
import org.agromarket.agro_server.util.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;

  @Override
  public UserDetailsService userDetailsService() {
    return new UserDetailsService() {
      @Override
      public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository
            .findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
      }
    };
  }

  @Override
  public User getUserByEmail(String email) {
    return userRepository
        .getUserByEmail(email)
        .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
  }

  @Transactional
  @Override
  public ResponseEntity<BaseResponse> updateInfo(ProfileRequest profileRequest) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currentUser = (User) authentication.getPrincipal();

    currentUser.setFullName(profileRequest.getFullName());
    currentUser.setPhoneNumber(profileRequest.getPhoneNumber());
    currentUser.setAddress(profileRequest.getAddress());
    currentUser.setDateOfBirth(profileRequest.getDateOfBirth());
    if (profileRequest.getAvatarUrl() != null) {
      currentUser.setAvatarUrl(profileRequest.getAvatarUrl());
    }
    User updatedUser = userRepository.save(currentUser);

    UserResponse responseUser = userMapper.convertToResponse(updatedUser);
    return ResponseEntity.ok(
        new BaseResponse("Update profile successfully!", HttpStatus.OK.value(), responseUser));
  }

  @Override
  public ResponseEntity<BaseResponse> getCurrentProfile() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currentUser = (User) authentication.getPrincipal();
    if (currentUser == null) {
      throw new NotFoundException("User currently logged in not found!");
    }

    UserResponse responseUser = userMapper.convertToResponse(currentUser);
    return ResponseEntity.ok(
        new BaseResponse(
            "Found information about the current user", HttpStatus.OK.value(), responseUser));
  }
}
