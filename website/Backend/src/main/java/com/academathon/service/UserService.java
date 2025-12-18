package com.academathon.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.academathon.model.User;
import com.academathon.repository.UserRepository;
import com.academathon.dto.UpdateProfileRequest;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository, EmailService emailService){
        this.userRepository = userRepository;
    }

    public List<User> allUsers(){
        List<User> users = new ArrayList<>();
        userRepository.findAll().forEach(users::add);
        return users;
    }

    public void deleteUserByEmail(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            System.out.println("Deleting user with email: " + email + " (ID: " + user.getId() + ")");
            userRepository.delete(user);
            System.out.println("Successfully deleted user: " + email);
        });
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public User updateProfilePictureUrl(Long userId, String profilePictureUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setProfilePictureUrl(profilePictureUrl);
        return userRepository.save(user);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update fields if they are provided
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            // Check if email is already taken by another user
            userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(userId)) {
                    throw new RuntimeException("Email already in use");
                }
            });
            user.setEmail(request.getEmail());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getPronouns() != null) {
            user.setPronouns(request.getPronouns());
        }
        if (request.getContactEmail() != null) {
            user.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            user.setContactPhone(request.getContactPhone());
        }
        
        return userRepository.save(user);
    }
}
