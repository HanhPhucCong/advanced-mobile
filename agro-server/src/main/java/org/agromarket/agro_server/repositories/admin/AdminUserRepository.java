package org.agromarket.agro_server.repositories.admin;
import org.agromarket.agro_server.common.Role;
import org.agromarket.agro_server.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminUserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(Role role);
}
