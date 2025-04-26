package org.agromarket.agro_server.service.customer.Impl;

import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.exception.CustomException;
import org.agromarket.agro_server.model.dto.response.OrderResponse;
import org.agromarket.agro_server.service.customer.MailService;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    private void sendEmail(String toEmail, String subject, String templateFile, Context context) {
        try {
            MimeMessagePreparator preparator =
                    mimeMessage -> {
                        MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                        messageHelper.setTo(toEmail);
                        messageHelper.setSubject(subject);
                        String content = templateEngine.process(templateFile, context);
                        messageHelper.setText(content, true);
                    };
            mailSender.send(preparator);
        } catch (Exception e) {
            throw new CustomException(
                    "Error sending email: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Async
    @Override
    public void sendMailVerify(
            String toEmail, String userName, String verifyCode, String templateFile) {
        Context context = new Context();
        context.setVariable("UserName", userName);
        context.setVariable("ToEmail", toEmail);
        context.setVariable("VerifyCode", verifyCode);
        sendEmail(toEmail, "Agriculture Market - Verification code", templateFile, context);
    }

    @Async
    @Override
    public void sendPasswordRecoveryMail(
            String toEmail, String userName, String verifyCode, String templateFile) {
        Context context = new Context();
        context.setVariable("UserName", userName);
        context.setVariable("ToEmail", toEmail);
        context.setVariable("VerifyCode", verifyCode);
        sendEmail(toEmail, "Agriculture Market - Password Recovery", templateFile, context);
    }

    @Async
    @Override
    public void sendMailConfirmOrder(String toEmail, String userName, OrderResponse orderResponse, String templateFile) {
        Context context = new Context();
        context.setVariable("UserName", userName);
        context.setVariable("ShippingAddress", orderResponse.getShippingAddress());
        context.setVariable("PhoneNumber", orderResponse.getPhoneNumber());
        context.setVariable("TotalAmount", String.format("%,.0f", orderResponse.getTotalAmount())); // format tiền VNĐ
        context.setVariable("PaymentMethod", orderResponse.getPaymentMethod().name());

        sendEmail(toEmail, "Agriculture Market - Đơn hàng đã xác nhận", templateFile, context);
    }

}
