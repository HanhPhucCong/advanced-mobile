package org.agromarket.agro_server.service.admin;

import org.agromarket.agro_server.common.Role;
import org.agromarket.agro_server.model.dto.admin.InforUserDTO;
import org.agromarket.agro_server.model.entity.User;
import org.agromarket.agro_server.repositories.admin.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminUserService {
    @Autowired
    private AdminUserRepository adminUserRepository;

    public List<InforUserDTO> getAllUser() {
        List<User> users = adminUserRepository.findByRole(Role.CUSTOMER);
        List<InforUserDTO> inforUserDTOS = new ArrayList<>();
        for (User user : users) {
            InforUserDTO inforUserDTO = new InforUserDTO();
            inforUserDTO.setId(user.getId());
            inforUserDTO.setEmail(user.getEmail());
            inforUserDTO.setAddress(user.getAddress());
            inforUserDTO.setFullName(user.getFullName());
            inforUserDTO.setOrders(user.getOrders().size());
            inforUserDTO.setAvatarUrl(user.getAvatarUrl());
            inforUserDTO.setPhoneNumber(user.getPhoneNumber());
            inforUserDTO.setDateOfBirth(user.getDateOfBirth());
            inforUserDTO.setIsDeleted(user.getIsDeleted());
            inforUserDTO.setIsDeleted(user.getIsDeleted());
            inforUserDTOS.add(inforUserDTO);
        }
        return inforUserDTOS;
    }

    public InforUserDTO getUser(Long id) {
        User user = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + id + " not found."));
        InforUserDTO inforUserDTO = new InforUserDTO();
        inforUserDTO.setId(user.getId());
        inforUserDTO.setEmail(user.getEmail());
        inforUserDTO.setAddress(user.getAddress());
        inforUserDTO.setFullName(user.getFullName());
        inforUserDTO.setOrders(user.getOrders().size());
        inforUserDTO.setAvatarUrl(user.getAvatarUrl());
        inforUserDTO.setPhoneNumber(user.getPhoneNumber());
        inforUserDTO.setDateOfBirth(user.getDateOfBirth());
        inforUserDTO.setIsDeleted(user.getIsDeleted());
        inforUserDTO.setIsDeleted(user.getIsDeleted());
        return inforUserDTO;
    }

    public void deleteUser(Long id) {
        User existingUser = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + id + " not found."));
        existingUser.setIsDeleted(true);
        existingUser.setIsActive(false);
        adminUserRepository.save(existingUser);
    }

    public void restoreUser(Long id) {
        User deletedUser = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + id + " not found."));
        if (Boolean.TRUE.equals(deletedUser.getIsDeleted())) {
            deletedUser.setIsDeleted(false);
            deletedUser.setIsActive(true);
            adminUserRepository.save(deletedUser);
        } else {
            throw new IllegalStateException("User with ID " + id + " is not deleted.");
        }
    }

    public void delete(Long id) {
        User existingUser = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + id + " not found."));
        adminUserRepository.delete(existingUser);
    }
}
