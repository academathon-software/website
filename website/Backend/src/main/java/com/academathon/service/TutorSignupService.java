package com.academathon.service;

import com.academathon.dto.TutorSignupDTO;
import com.academathon.model.Subject;
import com.academathon.model.TutorInvitation;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;
import com.academathon.repository.SubjectRepository;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TutorSignupService {
    
    @Autowired
    private TutorInvitationService invitationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TutorProfileRepository tutorProfileRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public User signupTutor(TutorSignupDTO dto) {
        // 1. Validate invitation token
        TutorInvitation invitation = invitationService.validateToken(dto.token());
        
        // 2. Verify email matches invitation
        if (!invitation.getEmail().equalsIgnoreCase(dto.email())) {
            throw new RuntimeException("Email does not match invitation");
        }
        
        // 3. Check if user already exists
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("An account with this email already exists");
        }
        
        // 4. Create User with TUTOR role
        String displayName = dto.firstName() + " " + dto.lastName();
        User user = new User(
            displayName,
            dto.email(),
            passwordEncoder.encode(dto.password()),
            User.Role.TUTOR
        );
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(false);
        user = userRepository.save(user);
        
        // 5. Fetch or create subjects
        List<Subject> subjects = dto.subjects().stream()
            .map(subjectName -> subjectRepository.findByName(subjectName)
                .orElseGet(() -> subjectRepository.save(new Subject(subjectName))))
            .toList();
        
        // 6. Convert grade levels to JSON string
        String gradeLevelsJson = null;
        try {
            gradeLevelsJson = objectMapper.writeValueAsString(dto.gradeLevels());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize grade levels", e);
        }
        
        // 7. Create TutorProfile
        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setUser(user);
        tutorProfile.setDisplayName(displayName);
        tutorProfile.setBio(dto.bio() != null ? dto.bio() : "");
        tutorProfile.setHourlyRate(dto.hourlyRate() != null ? dto.hourlyRate() : BigDecimal.ZERO);
        tutorProfile.setUniversity(dto.university());
        tutorProfile.setProgram(dto.program());
        tutorProfile.setAcademicYear(dto.academicYear());
        tutorProfile.setSchoolEmail(dto.schoolEmail());
        tutorProfile.setGradeLevels(gradeLevelsJson);
        tutorProfile.setSubjects(subjects);
        tutorProfileRepository.save(tutorProfile);
        
        // 8. Mark invitation token as used
        invitationService.markTokenAsUsed(dto.token());
        
        // 9. Send verification email
        try {
            sendVerificationEmail(user);
        } catch (Exception e) {
            // Log error but don't fail the signup
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
        
        return user;
    }
    
    private String generateVerificationCode() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }
    
    private void sendVerificationEmail(User user) throws Exception {
        String subject = "Verify Your Academathon Account";
        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1A803D; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .code { 
                        font-size: 32px; 
                        font-weight: bold; 
                        letter-spacing: 5px; 
                        color: #1A803D; 
                        text-align: center; 
                        padding: 20px;
                        background-color: #e8f5e9;
                        border-radius: 5px;
                    }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Academathon!</h1>
                    </div>
                    <div class="content">
                        <p>Hi there,</p>
                        <p>Thank you for signing up as a tutor on Academathon. To complete your registration, please verify your email address.</p>
                        <p>Your verification code is:</p>
                        <div class="code">%s</div>
                        <p>This code will expire in 15 minutes.</p>
                        <p>If you didn't create this account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 Academathon. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, user.getVerificationCode());
        
        emailService.sendVerificationEmail(user.getEmail(), subject, htmlContent);
    }
}

