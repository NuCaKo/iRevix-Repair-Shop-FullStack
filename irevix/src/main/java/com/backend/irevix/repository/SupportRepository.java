package com.backend.irevix.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.irevix.model.Support;

@Repository
public interface SupportRepository extends JpaRepository<Support, Long> {
    Optional<Support> findBySupportId(int supportId);
    List<Support> findByStatus(String status);
    List<Support> findByIsRead(boolean isRead);
    List<Support> findByCustomer(String customer);
    List<Support> findByCategory(String category);
    List<Support> findByUserId(String userId);
    int countByIsRead(boolean isRead);
}