package org.agromarket.agro_server.service.customer.Impl;

import org.agromarket.agro_server.model.dto.response.NotificationDTO;
import org.agromarket.agro_server.model.entity.Notification;
import org.agromarket.agro_server.model.entity.User;
import org.agromarket.agro_server.repositories.customer.NotificationRepository;
import org.agromarket.agro_server.repositories.customer.UserRepository;
import org.agromarket.agro_server.service.customer.NotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    // Constructor injection cho các dependency
    public NotificationServiceImpl(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    /**
     * Tạo và gửi thông báo cho một người dùng cụ thể.
     * Sau khi lưu thông báo vào DB, gửi thông báo qua WebSocket.
     */
    @Override
    public void createAndSendNotification(Notification notification) {
        if (notification.getCreatedDate() == null) {
            notification.setCreatedDate(LocalDateTime.now());
        }
        notificationRepository.save(notification);
        messagingTemplate.convertAndSendToUser(notification.getUser().getUsername(), "/queue/notifications", notification);
    }

    @Override
    public List<NotificationDTO> getAllNotificationByUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        List<Notification> notifications = notificationRepository.findByUser(user);

        return notifications.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public void changeStatus(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }

    /**
     * Gửi thông báo broadcast (cho tất cả người dùng) khi có sự kiện chung như sản phẩm mới.
     */
    @Override
    public void sendBroadcastNotification(String title, String content) {
        List<User> users = userRepository.findAll();

        // gửi thông báo cho mỗi người
        for (User user : users) {
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setContent(content);
            notification.setReadStatus(false);
            notification.setCreatedDate(LocalDateTime.now());

            notification.setUser(user);
            notificationRepository.save(notification);

            messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", notification);
        }
    }


    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setContent(notification.getContent());
        dto.setReadStatus(notification.isReadStatus());
        dto.setCreatedDate(notification.getCreatedDate());
        return dto;
    }
}