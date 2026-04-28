package com.luminamart.ecommerce.repository;

import com.luminamart.ecommerce.model.Product;
import com.luminamart.ecommerce.model.Review;
import com.luminamart.ecommerce.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductOrderByCreatedAtDesc(Product product);
    Optional<Review> findByProductAndUser(Product product, User user);
    List<Review> findByUser(User user);
}
