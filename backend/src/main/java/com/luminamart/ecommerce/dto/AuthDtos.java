package com.luminamart.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record AuthRequest(
            @Email(message = "must be a valid email address") @NotBlank(message = "is required") String email,
            @NotBlank(message = "is required") @Size(min = 8, max = 72, message = "must be between 8 and 72 characters") String password
    ) {
    }

    public record RegisterRequest(
            @NotBlank(message = "is required") @Size(min = 2, max = 40, message = "must be between 2 and 40 characters") String firstName,
            @NotBlank(message = "is required") @Size(min = 2, max = 40, message = "must be between 2 and 40 characters") String lastName,
            @Email(message = "must be a valid email address") @NotBlank(message = "is required") String email,
            @NotBlank(message = "is required") @Size(min = 8, max = 72, message = "must be between 8 and 72 characters") String password
    ) {
    }

    public record UserSummary(
            Long id,
            String firstName,
            String lastName,
            String email,
            String avatarUrl
    ) {
    }

    public record AuthResponse(
            String token,
            String message,
            UserSummary user
    ) {
    }

    public record ForgotPasswordRequest(
            @Email(message = "must be a valid email address") @NotBlank(message = "is required") String email
    ) {}

    public record VerifyOtpRequest(
            @Email(message = "must be a valid email address") @NotBlank(message = "is required") String email,
            @NotBlank(message = "is required") String otp
    ) {}

    public record ResetPasswordRequest(
            @Email(message = "must be a valid email address") @NotBlank(message = "is required") String email,
            @NotBlank(message = "is required") String otp,
            @NotBlank(message = "is required") @Size(min = 8, max = 72, message = "must be between 8 and 72 characters") String newPassword
    ) {}
}
