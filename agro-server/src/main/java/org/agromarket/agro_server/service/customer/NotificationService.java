package org.agromarket.agro_server.service.customer;

import org.agromarket.agro_server.model.dto.response.NotificationDTO;
import org.agromarket.agro_server.model.entity.Notification;

import java.util.List;

public interface NotificationService {
    /**
     * Tạo và gửi thông báo cho người dùng.
     * Phương thức này thường được dùng khi đơn hàng được đặt thành công,
     * hoặc khi có thay đổi về đơn hàng của người dùng.
     */
    void createAndSendNotification(Notification notification);
    List<NotificationDTO> getAllNotificationByUser();
    void changeStatus(Long notificationId);

    /**
     * Gửi thông báo broadcast cho tất cả người dùng.
     * Phương thức này thường được dùng khi có sản phẩm mới.
     */
    void sendBroadcastNotification(String title, String content);
}
