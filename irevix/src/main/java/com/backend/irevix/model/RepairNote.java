package com.backend.irevix.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_note")
public class RepairNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long repairOrderId;  // Hangi tamir kaydıyla ilişkilendirileceği
    private String content;
    private LocalDateTime timestamp;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRepairOrderId() {
        return repairOrderId;
    }

    public void setRepairOrderId(Long repairOrderId) {
        this.repairOrderId = repairOrderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
