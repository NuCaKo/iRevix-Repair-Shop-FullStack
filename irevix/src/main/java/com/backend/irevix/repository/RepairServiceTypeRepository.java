package com.backend.irevix.repository;

import com.backend.irevix.model.RepairServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairServiceTypeRepository extends JpaRepository<RepairServiceType, Long> {
    List<RepairServiceType> findByDeviceType(String deviceType);
    List<RepairServiceType> findByIsActiveTrue();
    List<RepairServiceType> findByDeviceTypeAndIsActiveTrue(String deviceType);
}