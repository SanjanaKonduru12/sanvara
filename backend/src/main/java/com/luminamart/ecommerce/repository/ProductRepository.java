package com.luminamart.ecommerce.repository;

import com.luminamart.ecommerce.model.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findTop6ByFeaturedTrueOrderByRatingAverageDesc();
    List<Product> findTop8ByOrderByCreatedAtDesc();
    boolean existsByNameIgnoreCase(String name);
}
