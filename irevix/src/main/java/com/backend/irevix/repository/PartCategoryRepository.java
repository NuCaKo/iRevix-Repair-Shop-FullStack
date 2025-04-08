package com.backend.irevix.repository;

import com.backend.irevix.model.PartCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartCategoryRepository extends JpaRepository<PartCategory, Long> {
    @Query("SELECT pc FROM PartCategory pc WHERE pc.device.id = :deviceId")
    List<PartCategory> findByDeviceId(Long deviceId);
}