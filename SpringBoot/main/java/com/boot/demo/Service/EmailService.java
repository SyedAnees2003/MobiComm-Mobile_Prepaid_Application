package com.boot.demo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.boot.demo.Model.RechargeHistory;

import jakarta.mail.internet.MimeMessage;

@Service
@ComponentScan(basePackages = "com.boot.demo")
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;

        public void sendPaymentReceipt(String toEmail, String userName, String transactionId, double amount, String paymentMethod, String plan) {
            try {
                // Create a MimeMessage for sending HTML emails
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                // ✅ Set sender email (must match `spring.mail.username`)
                helper.setFrom("kdhanuja5@gmail.com");
                
                // ✅ Set recipient email
                helper.setTo(toEmail);
                
                // ✅ Set email subject
                helper.setSubject("Payment Successful - MobiComm Recharge");
                
                // ✅ Set email body (HTML formatted)
                String emailContent = "<p>Dear <b>" + userName + "</b>,</p>"
                    + "<p>Thank you for your payment. Your recharge was successful.</p>"
                    + "<ul>"
                    + "<li><b>Transaction ID:</b> " + transactionId + "</li>"
                    + "<li><b>Amount Paid:</b> Rs. " + amount + "</li>"
                    + "<li><b>Plan Activated:</b> " + plan + "</li>"
                    + "<li><b>Payment Method:</b> " + paymentMethod + "</li>"
                    + "</ul>"
                    + "<p>For any queries, please contact our support.</p>"
                    + "<p>Regards,<br><b>MobiComm Team</b></p>";

                helper.setText(emailContent, true); // `true` enables HTML formatting
                
                // ✅ Send the email
                mailSender.send(message);
                System.out.println("✅ Email sent successfully to: " + toEmail);

            } catch (Exception e) {
                System.err.println("❌ Failed to send email: " + e.getMessage());
            }
        }
        
        // ✅ Send Subscription Expiry Alert Email
        public void sendExpiryAlertEmail(String toEmail, String userName, String mobile, List<RechargeHistory> rechargeHistoryList) {
            try {
                // ✅ Create a MimeMessage for sending HTML emails
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                // ✅ Set sender email (must match `spring.mail.username`)
                helper.setFrom("kdhanuja5@gmail.com");

                // ✅ Set recipient email
                helper.setTo(toEmail);

                // ✅ Set email subject
                helper.setSubject("⚠️ Subscription Expiry Alert - MobiComm");

                // ✅ Get the latest recharge details
                String lastRechargePlan = (rechargeHistoryList != null && !rechargeHistoryList.isEmpty())
                        ? rechargeHistoryList.get(0).getPlan().getPlanName()
                        : "Unknown Plan";

                String lastRechargeDate = (rechargeHistoryList != null && !rechargeHistoryList.isEmpty())
                        ? rechargeHistoryList.get(0).getRechargeDate().toString()
                        : "Unknown Date";

                // ✅ Set email body (HTML formatted)
                String emailContent = "<p>Dear <b>" + userName + "</b>,</p>"
                        + "<p>🚨 Your subscription for <b>" + lastRechargePlan + "</b> is expiring soon.</p>"
                        + "<ul>"
                        + "<li><b>Plan:</b> " + lastRechargePlan + "</li>"
                        + "<li><b>Last Recharge Date:</b> " + lastRechargeDate + "</li>"
                        + "<li><b>Mobile Number:</b> " + mobile + "</li>"
                        + "</ul>"
                        + "<p>🔄 Please recharge as soon as possible to continue uninterrupted service.</p>"
                        + "<p>For any queries, please contact our support team.</p>"
                        + "<p>Best regards,<br><b>MobiComm Team</b></p>";

                helper.setText(emailContent, true); // `true` enables HTML formatting

                // ✅ Send the email
                mailSender.send(message);
                System.out.println("✅ Expiry Alert Email sent successfully to: " + toEmail);

            } catch (Exception e) {
                System.err.println("❌ Failed to send expiry alert email: " + e.getMessage());
            }
        }
        
     // ✅ Send Reset Password Email
        public void sendResetPasswordEmail(String toEmail, String newPassword) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                helper.setFrom("kdhanuja5@gmail.com");
                helper.setTo(toEmail);
                helper.setSubject("🔐 Password Reset - MobiComm");

                // ✅ Email Body with New Password
                String emailContent = "<p>Dear User,</p>"
                        + "<p>Your password has been reset successfully.</p>"
                        + "<p><b>New Password:</b> " + newPassword + "</p>"
                        + "<p>We recommend changing your password after logging in.</p>"
                        + "<p>Regards,<br><b>MobiComm Team</b></p>";

                helper.setText(emailContent, true);
                mailSender.send(message);
                System.out.println("✅ Reset Password Email Sent Successfully to: " + toEmail);

            } catch (Exception e) {
                System.err.println("❌ Failed to send reset password email: " + e.getMessage());
            }
        }
}