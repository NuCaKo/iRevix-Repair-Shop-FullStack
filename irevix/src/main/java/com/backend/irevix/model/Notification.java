package com.backend.irevix.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private String time;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date date;

    @Column(name = "read_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date readAt;

    @PrePersist
    protected void onCreate() {
        if (this.date == null) {
            this.date = new Date();
        }
        if (this.isRead == null) {
            this.isRead = false;
        }
    }
}