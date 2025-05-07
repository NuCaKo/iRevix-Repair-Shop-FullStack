package com.backend.irevix.repository;

import com.backend.irevix.model.RepairServiceOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairServiceOptionRepository extends JpaRepository<RepairServiceOption, Long> {
    List<RepairServiceOption> findByServiceTypeId(Long serviceTypeId);
    List<RepairServiceOption> findByServiceTypeIdAndIsActiveTrue(Long serviceTypeId);
}