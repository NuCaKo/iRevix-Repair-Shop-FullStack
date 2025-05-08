package com.backend.irevix.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clerkUserId;
    private String deviceType;
    private String issue;
    private String status;

    private LocalDate orderDate;
    private LocalDate completionDate;
    private LocalDate estimatedCompletion;

    private BigDecimal cost;
    private String invoiceNo;

    // ✅ GETTERS
    public Long getId() {
        return id;
    }

    public String getClerkUserId() {
        return clerkUserId;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public String getIssue() {
        return issue;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public LocalDate getEstimatedCompletion() {
        return estimatedCompletion;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public String getInvoiceNo() {
        return invoiceNo;
    }

    // ✅ SETTERS
    public void setClerkUserId(String clerkUserId) {
        this.clerkUserId = clerkUserId;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public void setEstimatedCompletion(LocalDate estimatedCompletion) {
        this.estimatedCompletion = estimatedCompletion;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }
}
