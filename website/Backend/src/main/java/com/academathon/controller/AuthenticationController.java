package com.academathon.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.academathon.jwt.JWTService;
import com.academathon.model.User;
import com.academathon.responses.LoginResponse;
import com.academathon.responses.ErrorResponse;
import com.academathon.service.AuthenticationService;
import com.academathon.service.TutorSignupService;
import com.academathon.dto.LoginUserDTO;
import com.academathon.dto.RegisterUserDTO;
import com.academathon.dto.VerifyUserDTO;
import com.academathon.dto.TutorSignupDTO;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JWTService jwtService;
    private final AuthenticationService authenticationService;
    private final TutorSignupService tutorSignupService;

    public AuthenticationController(JWTService jwtService, AuthenticationService authenticationService, TutorSignupService tutorSignupService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.tutorSignupService = tutorSignupService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody RegisterUserDTO registerUserDto) {
        try {
            User registeredUser = authenticationService.signup(registerUserDto);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginUserDTO loginUserDto){
        try {
            User authenticatedUser = authenticationService.authenticate(loginUserDto);
            String jwtToken = jwtService.generateToken(authenticatedUser);
            LoginResponse loginResponse = new LoginResponse(
                jwtToken, 
                jwtService.getExpirationTime(), 
                authenticatedUser.getRole().toString(),
                authenticatedUser.getId(),
                authenticatedUser.getDisplayUsername()
            );
            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyUserDTO verifyUserDto) {
        try {
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("Account verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code sent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/enable-user")
    public ResponseEntity<?> enableUser(@RequestParam String email) {
        try {
            authenticationService.enableUser(email);
            return ResponseEntity.ok("User enabled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/delete-user")
    public ResponseEntity<?> deleteUser(@RequestParam String email) {
        try {
            authenticationService.deleteUser(email);
            return ResponseEntity.ok("User deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/signup/tutor")
    public ResponseEntity<?> registerTutor(@RequestBody TutorSignupDTO tutorSignupDto) {
        try {
            User registeredTutor = tutorSignupService.signupTutor(tutorSignupDto);
            return ResponseEntity.ok(registeredTutor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
}


