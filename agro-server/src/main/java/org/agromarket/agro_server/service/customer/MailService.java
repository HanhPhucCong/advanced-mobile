package org.agromarket.agro_server.service.customer;

import org.agromarket.agro_server.model.dto.response.OrderResponse;

public interface MailService {
    public void sendMailVerify(
            String toEmail, String userName, String verifyCode, String templateFile);

    public void sendPasswordRecoveryMail(
            String toEmail, String userName, String verifyCode, String templateFile);

    public void sendMailConfirmOrder(String toEmail, String userName, OrderResponse orderResponse,
                                     String templateFile);
}
