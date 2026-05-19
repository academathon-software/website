package com.academathon.service;

import com.academathon.model.User;
import com.academathon.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;

@Service
public class AdminSeederService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private static final String ADMIN_EMAIL = "admin@academathon.com";
    private static final String ADMIN_USERNAME = "Administrator";
    private static final String CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    private static final int PASSWORD_LENGTH = 20;
    
    @PostConstruct
    public void seedAdminUser() {
        if (userRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
            System.out.println("Admin user already exists. Skipping admin creation.");
            return;
        }

        // Skip if the username is already taken — e.g. a prior seed run created
        // an admin under a different email. Avoids a unique-constraint crash.
        if (userRepository.findByUsername(ADMIN_USERNAME).isPresent()) {
            System.out.println("Admin username '" + ADMIN_USERNAME
                + "' already exists under a different email. Skipping admin creation. "
                + "Update that row's email to " + ADMIN_EMAIL + " (or delete it) to re-seed.");
            return;
        }

        String generatedPassword = generateSecurePassword();

        User admin = new User();
        admin.setEmail(ADMIN_EMAIL);
        admin.setUsername(ADMIN_USERNAME);
        admin.setPasswordHash(passwordEncoder.encode(generatedPassword));
        admin.setRole(User.Role.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);

        displayAdminCredentials(generatedPassword);
    }
    
    private String generateSecurePassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);
        
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            int randomIndex = random.nextInt(CHARSET.length());
            password.append(CHARSET.charAt(randomIndex));
        }
        
        return password.toString();
    }
    
    private void displayAdminCredentials(String password) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("ADMIN ACCOUNT CREATED SUCCESSFULLY");
        System.out.println("=".repeat(60));
        System.out.println("Email:    " + ADMIN_EMAIL);
        System.out.println("Password: " + password);
        System.out.println("=".repeat(60));
        System.out.println("⚠️  IMPORTANT: Save this password securely!");
        System.out.println("⚠️  This is the ONLY time it will be displayed.");
        System.out.println("=".repeat(60) + "\n");
    }
}

