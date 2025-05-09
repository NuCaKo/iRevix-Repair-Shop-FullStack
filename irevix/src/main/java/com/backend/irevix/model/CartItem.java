package com.backend.irevix.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonBackReference
    @JsonIgnoreProperties({"cart"})
    private Cart cart;

    private String name;
    private Double price;
    private int quantity;
    private String type; // 'part' veya 'service'
    private String partNumber;
    private String imageUrl;
    private String description;

    @ManyToOne
    @JoinColumn(name = "part_id", nullable = true)
    private ReplacementPart part;

    public Long getId() {
        return id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public ReplacementPart getPart() {
        return part;
    }

    public void setPart(ReplacementPart part) {
        this.part = part;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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