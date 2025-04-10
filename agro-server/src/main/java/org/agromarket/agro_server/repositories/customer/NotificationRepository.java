package org.agromarket.agro_server.repositories.customer;

import org.agromarket.agro_server.model.entity.Notification;
import org.agromarket.agro_server.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser(User user);
}
