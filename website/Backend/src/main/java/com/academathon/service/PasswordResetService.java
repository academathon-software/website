package com.academathon.service;

import com.academathon.model.PasswordResetToken;
import com.academathon.model.User;
import com.academathon.repository.PasswordResetTokenRepository;
import com.academathon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    private static final int TOKEN_EXPIRATION_HOURS = 24;
    
    @Transactional
    public void createPasswordResetToken(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            // Don't reveal if user exists or not for security
            return;
        }
        
        User user = userOptional.get();
        
        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);
        
        // Generate new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user, TOKEN_EXPIRATION_HOURS);
        passwordResetTokenRepository.save(resetToken);
        
        // Send email with reset link
        sendPasswordResetEmail(user, token);
    }
    
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByToken(token);
        
        if (tokenOptional.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        
        // Check if token is expired or already used
        if (resetToken.isExpired() || resetToken.getUsed()) {
            return false;
        }
        
        // Update user password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        
        return true;
    }
    
    private void sendPasswordResetEmail(User user, String token) {
        String baseUrl = frontendUrl == null ? "" : frontendUrl.replaceAll("/+$", "");
        String resetLink = baseUrl + "/reset-password?token=" + token;
        String subject = "Password Reset Request - Academathon";
        String body = String.format(
            "Hello %s,\n\n" +
            "We received a request to reset your password. Click the link below to reset your password:\n\n" +
            "%s\n\n" +
            "This link will expire in %d hours.\n\n" +
            "If you didn't request a password reset, please ignore this email or contact our support team.\n\n" +
            "Best regards,\n" +
            "Academathon Team",
            user.getUsername(),
            resetLink,
            TOKEN_EXPIRATION_HOURS
        );
        
        emailService.sendEmail(user.getEmail(), subject, body);
    }
}

