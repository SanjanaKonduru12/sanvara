package com.luminamart.ecommerce.service;

import com.luminamart.ecommerce.model.User;
import com.luminamart.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CustomerOrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final PriceAlertRepository priceAlertRepository;
    private final ReviewRepository reviewRepository;

    public AdminService(UserRepository userRepository,
                        CustomerOrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        WishlistItemRepository wishlistItemRepository,
                        PriceAlertRepository priceAlertRepository,
                        ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.priceAlertRepository = priceAlertRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public int clearAllUsers() {
        List<User> users = userRepository.findAll();
        int count = 0;
        for (User user : users) {
            deleteUserDependencies(user);
            userRepository.delete(user);
            count++;
        }
        System.out.println("Deleted " + count + " users and their dependencies.");
        return count;
    }

    @Transactional
    public void deleteUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        deleteUserDependencies(user);
        userRepository.delete(user);
    }

    private void deleteUserDependencies(User user) {
        cartItemRepository.deleteByUser(user);
        wishlistItemRepository.deleteAll(wishlistItemRepository.findByUserOrderByCreatedAtDesc(user));
        priceAlertRepository.deleteAll(priceAlertRepository.findByUserOrderByCreatedAtDesc(user));
        reviewRepository.deleteAll(reviewRepository.findByUser(user));
        orderRepository.deleteAll(orderRepository.findByUserOrderByPlacedAtDesc(user));
    }
}
