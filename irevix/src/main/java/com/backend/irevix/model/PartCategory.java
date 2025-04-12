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
    public Long getDeviceId() {
        return device != null ? device.getId() : null;
    }
    public void setDeviceId(Long deviceId) {
    }
}