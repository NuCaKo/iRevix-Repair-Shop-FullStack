package com.backend.irevix.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clerk_user_id")
    private String clerkUserId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "issue")
    private String issue;

    @Column(name = "status")
    private String status;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "estimated_completion")
    private LocalDate estimatedCompletion;

    @Column(name = "appointment_date_time")
    private LocalDateTime appointmentDateTime;

    @Column(name = "cost")
    private BigDecimal cost;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<OrderItem> orderItems = new ArrayList<>();

    // === Utility ===
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    // === Getters ===
    public Long getId() { return id; }
    public String getClerkUserId() { return clerkUserId; }
    public String getCustomerName() { return customerName; }
    public String getDeviceType() { return deviceType; }
    public String getIssue() { return issue; }
    public String getStatus() { return status; }
    public LocalDate getOrderDate() { return orderDate; }
    public LocalDate getCompletionDate() { return completionDate; }
    public LocalDate getEstimatedCompletion() { return estimatedCompletion; }
    public LocalDateTime getAppointmentDateTime() { return appointmentDateTime; }
    public BigDecimal getCost() { return cost; }
    public String getInvoiceNo() { return invoiceNo; }
    public LocalDate getCreatedAt() { return createdAt; }
    public LocalDate getUpdatedAt() { return updatedAt; }
    public List<OrderItem> getOrderItems() { return orderItems; }

    // === Setters ===
    public void setId(Long id) { this.id = id; }
    public void setClerkUserId(String clerkUserId) { this.clerkUserId = clerkUserId; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }
    public void setIssue(String issue) { this.issue = issue; }
    public void setStatus(String status) { this.status = status; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
    public void setEstimatedCompletion(LocalDate estimatedCompletion) { this.estimatedCompletion = estimatedCompletion; }
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) { this.appointmentDateTime = appointmentDateTime; }
    public void setCost(BigDecimal cost) { this.cost = cost; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", customerName='" + customerName + '\'' +
                ", deviceType='" + deviceType + '\'' +
                ", status='" + status + '\'' +
                ", orderDate=" + orderDate +
                ", appointmentDateTime=" + appointmentDateTime +
                '}';
    }
}
