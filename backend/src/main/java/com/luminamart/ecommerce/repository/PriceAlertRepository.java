package com.luminamart.ecommerce.repository;

import com.luminamart.ecommerce.model.PriceAlert;
import com.luminamart.ecommerce.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findByUserOrderByCreatedAtDesc(User user);
    Optional<PriceAlert> findByIdAndUser(Long id, User user);
}
