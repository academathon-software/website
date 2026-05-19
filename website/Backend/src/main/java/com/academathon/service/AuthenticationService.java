package com.academathon.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.academathon.dto.LoginUserDTO;
import com.academathon.dto.RegisterUserDTO;
import com.academathon.dto.VerifyUserDTO;
import com.academathon.model.User;
import com.academathon.repository.UserRepository;

import jakarta.mail.MessagingException;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                AuthenticationManager authenticationManager,
                                EmailService emailService){
         this.userRepository = userRepository;
         this.passwordEncoder = passwordEncoder;
         this.authenticationManager = authenticationManager;
         this.emailService = emailService;                           
    }

    public User signup(RegisterUserDTO input){
        // Pronouns are required for every new account
        if (input.getPronouns() == null || input.getPronouns().isBlank()) {
            throw new RuntimeException("Pronouns are required.");
        }
        // Students must declare which grade they're learning at
        if (input.getRole() == User.Role.STUDENT
                && (input.getStudentGrade() == null || input.getStudentGrade().isBlank())) {
            throw new RuntimeException("Grade is required for student accounts.");
        }

        // Check if user with this email already exists
        if (userRepository.findByEmail(input.getEmail()).isPresent()) {
            throw new RuntimeException("An account with this email address already exists. Please use a different email or try logging in.");
        }
        
        // Check if user with this username already exists
        if (userRepository.findByUsername(input.getUsername()).isPresent()) {
            throw new RuntimeException("This username is already taken. Please choose a different username.");
        }
        
        User user = new User(input.getUsername(), input.getEmail(), passwordEncoder.encode(input.getPassword()), input.getRole());
        user.setPronouns(input.getPronouns());
        if (input.getRole() == User.Role.STUDENT) {
            user.setStudentGrade(input.getStudentGrade());
        }
        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(false);
        sendVerificationEmail(user);
        return userRepository.save(user);
    }

    public User authenticate(LoginUserDTO input){
        User user = userRepository.findByEmail(input.getEmail())
                                                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // First verify the password is correct
        if (!passwordEncoder.matches(input.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        // If account is not verified, resend verification code
        if (!user.isEnabled()){
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            sendVerificationEmail(user);
            userRepository.save(user);
            throw new RuntimeException("VERIFICATION_REQUIRED:Account not verified. A new verification code has been sent to your email.");
        }
        
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword())
        );
        return user;
    }

    public void verifyUser(VerifyUserDTO input){
        Optional<User> optionalUser = userRepository.findByEmail(input.getEmail());
        if (optionalUser.isPresent()){
            User user = optionalUser.get();                
            if (user.getVerificationCodeExpiresAt() != null && user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())){
                throw new RuntimeException("Verification code has expired");
            }
            if (user.getVerificationCode() != null && user.getVerificationCode().equals(input.getVerificationCode())){
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
            }else{
                throw new RuntimeException("Invalid verification code");
            }
        }else{
            throw new RuntimeException("User not found");
        }
    }
    
    public void resendVerificationCode(String email){
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()){
            User user = optionalUser.get();
            if (user.isEnabled()){
                throw new RuntimeException("Account is already verified");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            userRepository.save(user);
       }else{
        throw new RuntimeException("User not found");
       }
    }

    public void sendVerificationEmail(User user){
        String subject = "Academathon - Verify Your Account";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0fdf4;\">"
                + "<div style=\"max-width: 560px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);\">"
                + "<div style=\"background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;\">"
                + "<h1 style=\"color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;\">Academathon</h1>"
                + "</div>"
                + "<div style=\"padding: 40px 32px;\">"
                + "<h2 style=\"color: #1a1a2e; margin: 0 0 8px; font-size: 20px;\">Verify your account</h2>"
                + "<p style=\"color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 28px;\">Thanks for signing up! Enter the code below in the app to activate your account.</p>"
                + "<div style=\"background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 24px; text-align: center;\">"
                + "<p style=\"margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;\">Verification Code</p>"
                + "<p style=\"margin: 0; font-size: 32px; font-weight: 700; color: #10b981; letter-spacing: 4px;\">" + verificationCode + "</p>"
                + "</div>"
                + "<p style=\"color: #9ca3af; font-size: 13px; margin: 24px 0 0; line-height: 1.5;\">This code expires in 15 minutes. If you didn't create an account, you can safely ignore this email.</p>"
                + "</div>"
                + "<div style=\"background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;\">"
                + "<p style=\"margin: 0; color: #9ca3af; font-size: 12px;\">&copy; Academathon. All rights reserved.</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";

        try{
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        }catch (MessagingException e){
            e.printStackTrace();
        }
    }

    private String generateVerificationCode(){
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

    public void enableUser(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setEnabled(true);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public void deleteUser(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            userRepository.delete(optionalUser.get());
        } else {
            throw new RuntimeException("User not found");
        }
    }
}
