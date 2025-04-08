package com.backend.irevix.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "part_number", nullable = false)
    private String partNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "stock_level", nullable = false)
    private int stockLevel;

    @Column(name = "reorder_point", nullable = false)
    private int reorderPoint;

    @Column(nullable = false)
    private double price;

    private String supplier;

    @Column(name = "device_type", nullable = false)
    private String deviceType;

    @Column(name = "model_type", nullable = false)
    private String modelType;

    @Column(name = "last_restocked")
    private String lastRestocked;

    @Column(name = "created_at", updatable = false)
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDate.now();
    }
}