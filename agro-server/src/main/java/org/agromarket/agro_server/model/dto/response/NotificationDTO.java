package org.agromarket.agro_server.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.agromarket.agro_server.model.entity.User;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title; // tieu de hien thi
    private String content; // noi dung thong bao
    private boolean readStatus; // nguoi dung da doc chua
    private LocalDateTime createdDate; // ngay goi thong bao
}
