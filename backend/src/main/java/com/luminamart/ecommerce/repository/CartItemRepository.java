package com.luminamart.ecommerce.repository;

import com.luminamart.ecommerce.model.CartItem;
import com.luminamart.ecommerce.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByIdAndUser(Long id, User user);
    void deleteByUser(User user);
}
