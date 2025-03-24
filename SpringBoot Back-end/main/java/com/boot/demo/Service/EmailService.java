package com.boot.demo.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

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
}