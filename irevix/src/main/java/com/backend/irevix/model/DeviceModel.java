package com.backend.irevix.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "device_models")
public class DeviceModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "is_premium")
    private boolean isPremium;

    @Column(name = "release_order")
    private int releaseOrder;

    // Helper method to get deviceId (for API backward compatibility)
    public Long getDeviceId() {
        return device != null ? device.getId() : null;
    }

    // Helper method to set device by id (handled by service layer)
    public void setDeviceId(Long deviceId) {
        // This is just a placeholder - actual implementation is in service
    }
}