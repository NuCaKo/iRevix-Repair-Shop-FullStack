package com.backend.irevix.repository;

import com.backend.irevix.model.Support;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportRepository extends JpaRepository<Support, Long> {
    Optional<Support> findBySupportId(int supportId);
    List<Support> findByStatus(String status);
    List<Support> findByIsRead(boolean isRead);
    List<Support> findByCustomer(String customer);
}