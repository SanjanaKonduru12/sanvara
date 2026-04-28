package com.luminamart.ecommerce.controller;

import com.luminamart.ecommerce.model.User;
import com.luminamart.ecommerce.model.UserRole;
import com.luminamart.ecommerce.repository.UserRepository;
import com.luminamart.ecommerce.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    @DeleteMapping("/clear-users")
    public ResponseEntity<?> clearAllUsers(Principal principal, @RequestParam(defaultValue = "false") boolean confirm) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        if (!confirm) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "You must append ?confirm=true to prevent accidental deletion."));
        }

        try {
            int count = adminService.clearAllUsers();
            return ResponseEntity.ok(Map.of("message", "Successfully deleted " + count + " users and their dependencies."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear users: " + e.getMessage()));
        }
    }

    @DeleteMapping("/user/{email}")
    public ResponseEntity<?> deleteUser(Principal principal, @PathVariable String email, @RequestParam(defaultValue = "false") boolean confirm) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied. Admin role required."));
        }

        if (!confirm) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "You must append ?confirm=true to prevent accidental deletion."));
        }

        try {
            adminService.deleteUserByEmail(email);
            return ResponseEntity.ok(Map.of("message", "Successfully deleted user: " + email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    private boolean isAdmin(Principal principal) {
        if (principal == null || principal.getName() == null) return false;
        User user = userRepository.findByEmailIgnoreCase(principal.getName()).orElse(null);
        return user != null && user.getRole() == UserRole.ADMIN;
    }
}
