package com.backend.irevix.repository;

import com.backend.irevix.model.RepairOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long> {
    List<RepairOrder> findAll();
    List<RepairOrder> findByStatus(String status);
    List<RepairOrder> findByCustomer(String customer);
    Optional<RepairOrder> findById(Long id);
    List<RepairOrder> findByPriority(String priority);
    List<RepairOrder> findByDate(String date);
}
