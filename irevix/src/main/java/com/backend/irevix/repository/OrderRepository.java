// OrderRepository.java
package com.backend.irevix.repository;

import com.backend.irevix.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByEmailAndStatusNot(String email, String status);
    List<Order> findByEmailAndStatus(String email, String status);
}
