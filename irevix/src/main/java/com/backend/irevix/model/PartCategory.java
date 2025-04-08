package com.backend.irevix.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "part_categories")
public class PartCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(nullable = false)
    private String category;

    private String prefix;

    private String icon;

    @Column(name = "base_price")
    private double basePrice;

    // Helper method to get deviceId (for API backward compatibility)
    public Long getDeviceId() {
        return device != null ? device.getId() : null;
    }

    // Helper method to set device by id (handled by service layer)
    public void setDeviceId(Long deviceId) {
        // This is just a placeholder - actual implementation is in service
    }
}