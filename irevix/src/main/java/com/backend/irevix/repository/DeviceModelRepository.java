package com.backend.irevix.repository;

import com.backend.irevix.model.DeviceModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {
    @Query("SELECT dm FROM DeviceModel dm WHERE dm.device.id = :deviceId")
    List<DeviceModel> findByDeviceId(Long deviceId);
}