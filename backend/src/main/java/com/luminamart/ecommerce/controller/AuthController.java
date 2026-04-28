package com.luminamart.ecommerce.controller;

import com.luminamart.ecommerce.dto.AuthDtos.AuthRequest;
import com.luminamart.ecommerce.dto.AuthDtos.AuthResponse;
import com.luminamart.ecommerce.dto.AuthDtos.RegisterRequest;
import com.luminamart.ecommerce.dto.AuthDtos.UserSummary;
import com.luminamart.ecommerce.dto.AuthDtos.ForgotPasswordRequest;
import com.luminamart.ecommerce.dto.AuthDtos.VerifyOtpRequest;
import com.luminamart.ecommerce.dto.AuthDtos.ResetPasswordRequest;
import com.luminamart.ecommerce.service.AuthService;
import java.security.Principal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummary> me(Principal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getName()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("OTP sent to your email.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok("OTP verified successfully.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully.");
    }
}
