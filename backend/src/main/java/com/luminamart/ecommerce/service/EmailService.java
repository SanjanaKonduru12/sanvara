package com.luminamart.ecommerce.service;

import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your OTP Code");
            message.setText("Your OTP for password reset is: " + otp + "\nThis OTP is valid for 5 minutes.");
            mailSender.send(message);
        } catch (MailAuthenticationException e) {
            System.err.println("Email Authentication Failed: Please check your Gmail App Password configuration.");
            throw new IllegalStateException("Failed to send email: Authentication failed.");
        } catch (MailException e) {
            System.err.println("Failed to send email to " + toEmail + ". Reason: " + e.getMessage());
            throw new IllegalStateException("Failed to send email: " + e.getMessage());
        }
    }
}
