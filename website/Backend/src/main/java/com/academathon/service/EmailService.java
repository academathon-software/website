package com.academathon.service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender emailSender;

    @Value("${app.email.from-address:noreply@academathon.ca}")
    private String fromAddress;

    @Value("${app.email.from-name:Academathon}")
    private String fromName;

    @Value("${app.email.reply-to:academathontutoring@gmail.com}")
    private String replyTo;

    public void sendVerificationEmail(String to, String subject, String text) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        applyFromAndReplyTo(helper);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text, true);

        emailSender.send(message);
    }

    public void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            applyFromAndReplyTo(helper);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false);

            emailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    private void applyFromAndReplyTo(MimeMessageHelper helper) throws MessagingException {
        try {
            helper.setFrom(fromAddress, fromName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromAddress);
        }
        if (replyTo != null && !replyTo.isBlank()) {
            helper.setReplyTo(replyTo);
        }
    }
}
