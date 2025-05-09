package com.backend.irevix.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sepet ilişkisi
    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonBackReference
    @JsonIgnoreProperties({"cart"})
    private Cart cart;

    // Temel ürün bilgileri
    private String name;
    private Double price;
    private int quantity;
    private String type; // 'part' veya 'service'
    private String partNumber;
    private String imageUrl;
    private String description;

    // Parça ilişkisi (varsa)
    @ManyToOne
    @JoinColumn(name = "part_id")
    private ReplacementPart part;

    // Servis randevusu için ek alanlar (sadece type=service olduğunda dolu olur)
    private String customerEmail;
    private String customerPhone;
    private String deviceType;
    private String deviceModel;
    private LocalDateTime appointmentDateTime;

    // === GETTERS ===
    public Long getId() {
        return id;
    }

    public Cart getCart() {
        return cart;
    }

    public String getName() {
        return name;
    }

    public Double getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public String getType() {
        return type;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public ReplacementPart getPart() {
        return part;
    }

    public String getDescription() {
        return description;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public String getDeviceModel() {
        return deviceModel;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    // === SETTERS ===
    public void setId(Long id) {
        this.id = id;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPart(ReplacementPart part) {
        this.part = part;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public void setDeviceModel(String deviceModel) {
        this.deviceModel = deviceModel;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    /**
     * Get the part ID for this cart item.
     * Required for inventory management.
     * @return The part ID from the associated part, or null if no part is associated
     */
    public Long getPartId() {
        // If we have a part object, return its ID
        if (part != null) {
            return part.getId();
        }
        // Otherwise, return null
        return null;
    }
}