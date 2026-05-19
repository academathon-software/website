package com.academathon.service;

import com.academathon.model.TutorInvitation;
import com.academathon.repository.TutorInvitationRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TutorInvitationService {
    @Autowired
    private TutorInvitationRepository invitationRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public TutorInvitation createInvitation(String email) throws MessagingException {
        // Check if invitation already exists for this email
        if (invitationRepository.existsByEmail(email)) {
            throw new RuntimeException("An invitation already exists for this email");
        }

        // Create new invitation
        TutorInvitation invitation = new TutorInvitation(email);
        invitation = invitationRepository.save(invitation);

        // Send invitation email
        sendInvitationEmail(invitation);

        return invitation;
    }

    public TutorInvitation validateToken(String token) {
        TutorInvitation invitation = invitationRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

        if (invitation.getStatus() == TutorInvitation.InvitationStatus.USED) {
            throw new RuntimeException("This invitation has already been used");
        }

        if (invitation.isExpired()) {
            invitation.setStatus(TutorInvitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new RuntimeException("This invitation has expired");
        }

        return invitation;
    }

    public void markTokenAsUsed(String token) {
        TutorInvitation invitation = invitationRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid invitation token"));

        invitation.markAsUsed();
        invitationRepository.save(invitation);
    }

    public java.util.List<TutorInvitation> getAllInvitations() {
        return invitationRepository.findAll();
    }

    public void deleteInvitation(Long id) {
        if (!invitationRepository.existsById(id)) {
            throw new RuntimeException("Invitation not found");
        }
        invitationRepository.deleteById(id);
    }

    public void resendInvitation(Long id) throws MessagingException {
        TutorInvitation invitation = invitationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (invitation.getStatus() == TutorInvitation.InvitationStatus.USED) {
            throw new RuntimeException("Cannot resend a used invitation");
        }

        // Update expiration date
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        invitation.setStatus(TutorInvitation.InvitationStatus.PENDING);
        invitationRepository.save(invitation);

        // Resend email
        sendInvitationEmail(invitation);
    }

    private void sendInvitationEmail(TutorInvitation invitation) throws MessagingException {
        String baseUrl = frontendUrl == null ? "" : frontendUrl.replaceAll("/+$", "");
        String signupLink = baseUrl + "/signup/tutor/" + invitation.getToken();
        
        String subject = "Invitation to Join Academathon as a Tutor";
        
        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1A803D; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px; background-color: #f9f9f9; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background-color: #1A803D; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
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
                        <p>Hello,</p>
                        <p>You've been invited to join Academathon as a tutor! We're excited to have you on our platform.</p>
                        <p>Click the button below to complete your registration:</p>
                        <div style="text-align: center;">
                            <a href="%s" class="button" style="color: white; text-decoration: none;">Complete Your Registration</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #1A803D;">%s</p>
                        <p><strong>This invitation will expire in 7 days.</strong></p>
                        <p>If you didn't request this invitation, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 Academathon. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, signupLink, signupLink);

        emailService.sendVerificationEmail(invitation.getEmail(), subject, htmlContent);
    }
}







