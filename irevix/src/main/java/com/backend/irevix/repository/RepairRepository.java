package com.backend.irevix.repository;

import com.backend.irevix.model.Repair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairRepository extends JpaRepository<Repair, Long> {
    List<Repair> findByStatus(String status);
    List<Repair> findByCustomer(String customer);
    List<Repair> findByDevice(String device);
    List<Repair> findByDate(String date);

    @Query("SELECT r FROM Repair r ORDER BY r.date DESC")
    List<Repair> findAllByOrderByDateDesc();
}