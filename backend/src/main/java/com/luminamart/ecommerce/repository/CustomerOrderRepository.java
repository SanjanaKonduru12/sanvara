package com.luminamart.ecommerce.repository;

import com.luminamart.ecommerce.model.CustomerOrder;
import com.luminamart.ecommerce.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByUserOrderByPlacedAtDesc(User user);
}
