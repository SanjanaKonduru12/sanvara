package com.luminamart.ecommerce.service;

import com.luminamart.ecommerce.dto.AuthDtos.AuthRequest;
import com.luminamart.ecommerce.dto.AuthDtos.AuthResponse;
import com.luminamart.ecommerce.dto.AuthDtos.RegisterRequest;
import com.luminamart.ecommerce.dto.AuthDtos.UserSummary;
import com.luminamart.ecommerce.model.User;
import com.luminamart.ecommerce.model.UserRole;
import com.luminamart.ecommerce.repository.UserRepository;
import com.luminamart.ecommerce.security.JwtTokenUtil;
import java.util.Locale;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;
import com.luminamart.ecommerce.dto.AuthDtos.ForgotPasswordRequest;
import com.luminamart.ecommerce.dto.AuthDtos.VerifyOtpRequest;
import com.luminamart.ecommerce.dto.AuthDtos.ResetPasswordRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenUtil jwtTokenUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("A user with this email already exists.");
        }

        User user = new User();
        user.setFirstName(normalizeName(request.firstName()));
        user.setLastName(normalizeName(request.lastName()));
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.CUSTOMER);
        user.setAvatarUrl("https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80");

        userRepository.saveAndFlush(user);
        String token = jwtTokenUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Account created successfully.", mapUser(user));
    }

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        if (user != null && user.getAccountLockedUntil() != null) {
            if (user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
                log.warn("Login attempt for locked account: {}", normalizedEmail);
                throw new IllegalArgumentException("Account is temporarily locked due to too many failed attempts. Please try again later.");
            } else {
                user.setAccountLockedUntil(null);
                user.setFailedLoginAttempts(0);
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (Exception e) {
            if (user != null) {
                user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                if (user.getFailedLoginAttempts() >= 5) {
                    user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
                    log.warn("Account locked for email: {} after 5 failed attempts.", normalizedEmail);
                } else {
                    log.warn("Failed login attempt for email: {}. Attempt {}/5", normalizedEmail, user.getFailedLoginAttempts());
                }
                userRepository.save(user);
            } else {
                log.warn("Failed login attempt for non-existent email: {}", normalizedEmail);
            }
            throw new IllegalArgumentException("Invalid credentials.");
        }

        if (user != null) {
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            userRepository.save(user);
        }

        log.info("Successful login for user: {}", normalizedEmail);
        String token = jwtTokenUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Login successful.", mapUser(user));
    }

    @Transactional(readOnly = true)
    public UserSummary getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found."));
        return mapUser(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new IllegalArgumentException("User not found with this email."));

        if (user.getOtpRequestWindowStart() == null || user.getOtpRequestWindowStart().isBefore(LocalDateTime.now().minusMinutes(1))) {
            user.setOtpRequestWindowStart(LocalDateTime.now());
            user.setOtpRequestCount(1);
        } else {
            if (user.getOtpRequestCount() >= 3) {
                log.warn("Rate limit exceeded for OTP requests for email: {}", request.email());
                throw new IllegalArgumentException("Too many OTP requests. Please wait a minute.");
            }
            user.setOtpRequestCount(user.getOtpRequestCount() + 1);
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setResetOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        user.setOtpFailedAttempts(0);
        userRepository.save(user);

        log.info("OTP generated and sent to email: {}", request.email());
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new IllegalArgumentException("User not found with this email."));

        if (user.getOtpFailedAttempts() >= 5) {
            throw new IllegalArgumentException("Too many invalid OTP attempts. Please request a new OTP.");
        }

        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.otp())) {
            user.setOtpFailedAttempts(user.getOtpFailedAttempts() + 1);
            userRepository.save(user);
            log.warn("Invalid OTP attempt for email: {}", request.email());
            throw new IllegalArgumentException("Invalid OTP.");
        }
        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired.");
        }
        log.info("OTP verified successfully for email: {}", request.email());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new IllegalArgumentException("User not found with this email."));

        if (user.getOtpFailedAttempts() >= 5) {
            throw new IllegalArgumentException("Too many invalid OTP attempts. Please request a new OTP.");
        }

        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.otp())) {
            user.setOtpFailedAttempts(user.getOtpFailedAttempts() + 1);
            userRepository.save(user);
            log.warn("Invalid OTP attempt during password reset for email: {}", request.email());
            throw new IllegalArgumentException("Invalid OTP.");
        }
        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setResetOtp(null);
        user.setOtpExpiry(null);
        user.setOtpFailedAttempts(0);
        user.setAccountLockedUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        
        log.info("Password successfully reset for email: {}", request.email());
    }

    private UserSummary mapUser(User user) {
        return new UserSummary(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getAvatarUrl()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String value) {
        String trimmed = value.trim().replaceAll("\\s+", " ");
        if (trimmed.isEmpty()) {
            return trimmed;
        }

        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT) + trimmed.substring(1);
    }
}
