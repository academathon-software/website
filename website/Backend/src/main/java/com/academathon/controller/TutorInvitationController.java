package com.academathon.controller;

import com.academathon.dto.TutorInvitationDTO;
import com.academathon.dto.ValidateTokenResponseDTO;
import com.academathon.model.TutorInvitation;
import com.academathon.responses.ErrorResponse;
import com.academathon.service.TutorInvitationService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tutor-invitations")
public class TutorInvitationController {
    
    @Autowired
    private TutorInvitationService invitationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createInvitation(@RequestBody TutorInvitationDTO dto) {
        try {
            TutorInvitation invitation = invitationService.createInvitation(dto.email());
            return ResponseEntity.ok().body(new InvitationCreatedResponse(
                invitation.getToken(),
                invitation.getEmail(),
                invitation.getExpiresAt().toString()
            ));
        } catch (MessagingException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to send invitation email: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/validate/{token}")
    public ResponseEntity<?> validateToken(@PathVariable String token) {
        try {
            TutorInvitation invitation = invitationService.validateToken(token);
            return ResponseEntity.ok(new ValidateTokenResponseDTO(
                true,
                invitation.getEmail(),
                "Token is valid"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(new ValidateTokenResponseDTO(
                false,
                null,
                e.getMessage()
            ));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllInvitations() {
        try {
            var invitations = invitationService.getAllInvitations();
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to retrieve invitations: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteInvitation(@PathVariable Long id) {
        try {
            invitationService.deleteInvitation(id);
            return ResponseEntity.ok().body(new MessageResponse("Invitation deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to delete invitation: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resendInvitation(@PathVariable Long id) {
        try {
            invitationService.resendInvitation(id);
            return ResponseEntity.ok().body(new MessageResponse("Invitation resent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Failed to resend invitation: " + e.getMessage()));
        }
    }

    // Response records
    private record InvitationCreatedResponse(
        String token,
        String email,
        String expiresAt
    ) {}

    private record MessageResponse(String message) {}
}







