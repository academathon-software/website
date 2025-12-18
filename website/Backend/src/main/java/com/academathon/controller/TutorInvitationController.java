package com.academathon.controller;

import com.academathon.dto.TutorInvitationDTO;
import com.academathon.dto.ValidateTokenResponseDTO;
import com.academathon.model.TutorInvitation;
import com.academathon.responses.ErrorResponse;
import com.academathon.service.TutorInvitationService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tutor-invitations")
public class TutorInvitationController {
    
    @Autowired
    private TutorInvitationService invitationService;

    @PostMapping
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

    // Response record for invitation creation
    private record InvitationCreatedResponse(
        String token,
        String email,
        String expiresAt
    ) {}
}







