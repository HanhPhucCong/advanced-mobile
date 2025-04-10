package org.agromarket.agro_server.controller.customer;

import org.agromarket.agro_server.model.dto.response.NotificationDTO;
import org.agromarket.agro_server.service.customer.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Lấy danh sách thông báo của người dùng hiện tại
    @GetMapping("/me")
    public ResponseEntity<List<NotificationDTO>> getMyNotifications() {
        List<NotificationDTO> notifications = notificationService.getAllNotificationByUser();
        return ResponseEntity.ok(notifications);
    }

    // Đánh dấu một thông báo là đã đọc
    @PatchMapping("/read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") Long id) {
        notificationService.changeStatus(id);
        return ResponseEntity.noContent().build();
    }
}
