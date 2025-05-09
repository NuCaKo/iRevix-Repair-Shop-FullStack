package com.backend.irevix.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "daily_revenue")
@Data
public class DailyRevenue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "revenue_id")
    @JsonIgnore
    private Revenue revenue;

    @Column(nullable = false)
    private String date;

    private double sales;
    private double repairs;
    private double total;
}