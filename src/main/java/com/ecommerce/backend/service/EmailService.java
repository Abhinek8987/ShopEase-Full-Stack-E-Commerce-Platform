package com.ecommerce.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String username, String otp, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("kumar12345abhinek@gmail.com", "ShopEase");
            helper.setTo(toEmail);

            String subject = purpose.equals("VERIFY") ? "Verify your ShopEase account" : "Reset your ShopEase password";
            helper.setSubject(subject);

            String html = buildEmailHtml(username, otp, purpose);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    private String buildEmailHtml(String username, String otp, String purpose) {
        String title = purpose.equals("VERIFY") ? "Verify Your Account" : "Reset Your Password";
        String message = purpose.equals("VERIFY")
            ? "Welcome to ShopEase! Use the OTP below to verify your account."
            : "We received a request to reset your password. Use the OTP below.";

        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px;text-align:center;">
                        <div style="font-size:32px;margin-bottom:8px;">🛍️</div>
                        <div style="color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px;">ShopEase</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px 36px;">
                        <h2 style="margin:0 0 8px;font-size:22px;color:#1e293b;">%s</h2>
                        <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6;">Hi <strong>%s</strong>, %s</p>
                        <div style="background:#f8fafc;border:2px dashed #6366f1;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                          <div style="color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Your OTP</div>
                          <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#6366f1;">%s</div>
                          <div style="color:#94a3b8;font-size:13px;margin-top:10px;">⏱ Valid for 10 minutes</div>
                        </div>
                        <p style="color:#94a3b8;font-size:13px;text-align:center;">If you didn't request this, please ignore this email.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8fafc;padding:20px 36px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 ShopEase. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(title, username, message, otp);
    }
}
