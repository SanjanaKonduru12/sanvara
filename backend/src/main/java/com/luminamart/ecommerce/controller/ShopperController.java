package com.luminamart.ecommerce.controller;

import com.luminamart.ecommerce.dto.ProductDtos;
import com.luminamart.ecommerce.dto.ShopperDtos;
import com.luminamart.ecommerce.model.User;
import com.luminamart.ecommerce.repository.UserRepository;
import com.luminamart.ecommerce.service.ShopperService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shop")
public class ShopperController {

    private final ShopperService shopperService;
    private final UserRepository userRepository;

    public ShopperController(ShopperService shopperService, UserRepository userRepository) {
        this.shopperService = shopperService;
        this.userRepository = userRepository;
    }

    @GetMapping("/cart")
    public ResponseEntity<ShopperDtos.CartSummary> getCart(Principal principal) {
        return ResponseEntity.ok(shopperService.getCart(currentUser(principal)));
    }

    @PostMapping("/cart")
    public ResponseEntity<ShopperDtos.CartItemView> addCartItem(Principal principal,
                                                               @Valid @RequestBody ShopperDtos.CartRequest request) {
        return ResponseEntity.ok(shopperService.addCartItem(currentUser(principal), request));
    }

    @PatchMapping("/cart/{itemId}")
    public ResponseEntity<ShopperDtos.CartItemView> updateCartItem(Principal principal,
                                                                  @PathVariable Long itemId,
                                                                  @Valid @RequestBody ShopperDtos.UpdateCartRequest request) {
        return ResponseEntity.ok(shopperService.updateCartItem(currentUser(principal), itemId, request));
    }

    @DeleteMapping("/cart/{itemId}")
    public ResponseEntity<Void> removeCartItem(Principal principal, @PathVariable Long itemId) {
        shopperService.removeCartItem(currentUser(principal), itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<ShopperDtos.OrderView> checkout(Principal principal,
                                                          @Valid @RequestBody ShopperDtos.CheckoutRequest request) {
        return ResponseEntity.ok(shopperService.checkout(currentUser(principal), request));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<ShopperDtos.OrderView>> orders(Principal principal) {
        return ResponseEntity.ok(shopperService.getOrders(currentUser(principal)));
    }

    @PostMapping("/reviews/{productId}")
    public ResponseEntity<ProductDtos.ReviewView> addReview(Principal principal,
                                                            @PathVariable Long productId,
                                                            @Valid @RequestBody ShopperDtos.ReviewRequest request) {
        return ResponseEntity.ok(shopperService.addReview(currentUser(principal), productId, request));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<ShopperDtos.CartItemView>> wishlist(Principal principal) {
        return ResponseEntity.ok(shopperService.getWishlist(currentUser(principal)));
    }

    @PostMapping("/wishlist")
    public ResponseEntity<ShopperDtos.CartItemView> addWishlistItem(Principal principal,
                                                                   @RequestParam Long productId) {
        return ResponseEntity.ok(shopperService.addWishlistItem(currentUser(principal), productId));
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<Void> removeWishlistItem(Principal principal, @PathVariable Long productId) {
        shopperService.removeWishlistItem(currentUser(principal), productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<ShopperDtos.PriceAlertView>> alerts(Principal principal) {
        return ResponseEntity.ok(shopperService.getAlerts(currentUser(principal)));
    }

    @PostMapping("/alerts")
    public ResponseEntity<ShopperDtos.PriceAlertView> createAlert(Principal principal,
                                                                 @Valid @RequestBody ShopperDtos.PriceAlertRequest request) {
        return ResponseEntity.ok(shopperService.createAlert(currentUser(principal), request));
    }

    @PatchMapping("/alerts/{alertId}")
    public ResponseEntity<ShopperDtos.PriceAlertView> updateAlert(Principal principal,
                                                                  @PathVariable Long alertId,
                                                                  @RequestParam boolean enabled) {
        return ResponseEntity.ok(shopperService.updateAlertStatus(currentUser(principal), alertId, enabled));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ShopperDtos.DashboardView> dashboard(Principal principal) {
        return ResponseEntity.ok(shopperService.getDashboard(currentUser(principal)));
    }

    private User currentUser(Principal principal) {
        return userRepository.findByEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found."));
    }
}
