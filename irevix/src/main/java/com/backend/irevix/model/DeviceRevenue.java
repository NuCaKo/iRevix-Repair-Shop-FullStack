package com.backend.irevix.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "device_revenue")
@Data
public class DeviceRevenue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "revenue_id")
    @JsonIgnore
    private Revenue revenue;  // Bu ilişki alanı

    private String device;

    // 'revenue' değil 'revenueValue' olarak değiştiriyoruz
    @Column(name = "revenue")
    private double revenueValue;  // Bu veri alanı

    @Column(name = "revenue_amount")
    private double revenueAmount;

    private double percentage;
}