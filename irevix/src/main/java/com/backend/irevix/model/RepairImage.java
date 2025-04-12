package com.backend.irevix.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class RepairImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;

    private String type; // 'before' veya 'during'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_order_id")
    @JsonBackReference
    private RepairOrder repairOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public RepairOrder getRepairOrder() {
        return repairOrder;
    }

    public void setRepairOrder(RepairOrder repairOrder) {
        this.repairOrder = repairOrder;
    }
}
