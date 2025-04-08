package com.backend.irevix.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "support_requests")
public class Support {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "support_id", unique = true)
    private int supportId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String status; // Open, In Progress, Closed

    @Column(nullable = false)
    private String priority; // High, Normal, Low

    private String category;
    private String date;

    @Column(nullable = false)
    private String customer;

    private String email;

    @Column(name = "is_read")
    private boolean isRead;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "support", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;

    @Entity
    @Table(name = "support_messages")
    @Data
    public static class Message {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "message_id")
        private int messageId;

        @ManyToOne
        @JoinColumn(name = "support_id")
        private Support support;

        @Column(nullable = false)
        private String sender;

        @Column(nullable = false, columnDefinition = "TEXT")
        private String message;

        @Column(name = "agent_name")
        private String agentName;

        private String date;
    }
}