package com.backend.irevix.repository;

import com.backend.irevix.model.Traffic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrafficRepository extends JpaRepository<Traffic, Long> {
    List<Traffic> findByPeriod(String period);

    @Query("SELECT t FROM Traffic t WHERE t.period = :period ORDER BY t.date ASC")
    List<Traffic> findByPeriodOrderByDateAsc(String period);
}