package com.luminamart.ecommerce.controller;

import com.luminamart.ecommerce.dto.ShopperDtos;
import com.luminamart.ecommerce.model.User;
import com.luminamart.ecommerce.repository.UserRepository;
import com.luminamart.ecommerce.service.ShopperService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final ShopperService shopperService;
    private final UserRepository userRepository;

    public OrderController(ShopperService shopperService, UserRepository userRepository) {
        this.shopperService = shopperService;
        this.userRepository = userRepository;
    }

    @PostMapping("/place")
    public ResponseEntity<ShopperDtos.OrderView> placeOrder(Principal principal,
                                                            @Valid @RequestBody ShopperDtos.CheckoutRequest request) {
        return ResponseEntity.ok(shopperService.checkout(currentUser(principal), request));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(Principal principal, @PathVariable Long orderId) {
        shopperService.cancelOrder(currentUser(principal), orderId);
        return ResponseEntity.ok("Order cancelled successfully.");
    }

    private User currentUser(Principal principal) {
        return userRepository.findByEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found."));
    }
}
