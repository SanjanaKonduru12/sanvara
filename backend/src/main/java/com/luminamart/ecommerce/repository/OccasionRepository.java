package com.luminamart.ecommerce.repository;

import com.luminamart.ecommerce.model.Occasion;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OccasionRepository extends JpaRepository<Occasion, Long> {
    Optional<Occasion> findByNameIgnoreCase(String name);
    Optional<Occasion> findBySlugIgnoreCase(String slug);
}
