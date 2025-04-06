package com.backend.irevix.repository;

import com.backend.irevix.model.RepairOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RepairOrderRepository extends JpaRepository<RepairOrder, Long> {

    // Tüm RepairOrder'ları almak için
    List<RepairOrder> findAll();

    // Status'a göre RepairOrder'ları almak için
    List<RepairOrder> findByStatus(String status);

    // Customer'a göre RepairOrder'ları almak için
    List<RepairOrder> findByCustomer(String customer);

    // Belirli bir RepairOrder'ı almak için
    Optional<RepairOrder> findById(Long id);

    // Priority'e göre RepairOrder'ları almak için
    List<RepairOrder> findByPriority(String priority);

    // Tarihe göre RepairOrder'ları almak için
    List<RepairOrder> findByDate(String date);
}
