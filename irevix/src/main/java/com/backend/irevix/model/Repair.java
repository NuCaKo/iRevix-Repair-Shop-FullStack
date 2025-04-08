package com.backend.irevix.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "repairs")
public class Repair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repair_id", unique = true)
    private String repairId;

    @Column(nullable = false)
    private String customer;

    @Column(nullable = false)
    private String device;

    @Column(columnDefinition = "TEXT")
    private String problem;

    @Column(nullable = false)
    private String status; // Pending, In Progress, Completed, Awaiting Parts

    @Column(nullable = false)
    private String date;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}