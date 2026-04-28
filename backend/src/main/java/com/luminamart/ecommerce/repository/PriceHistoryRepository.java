package com.luminamart.ecommerce.repository;

import com.luminamart.ecommerce.model.PriceHistory;
import com.luminamart.ecommerce.model.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByProductOrderByRecordedAtAsc(Product product);
}
