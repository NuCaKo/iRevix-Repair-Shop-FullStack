package com.backend.irevix.model;

import jakarta.persistence.*;



@Entity
public class ReplacementPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String partNumber;
    private String description;
    private Double price;
    private String modelName;
    private String imageUrl;
    private Integer stockQuantity;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ReplacementPartCategory category;

    // GETTER'lar
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPartNumber() {
        return partNumber;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public String getModelName() {
        return modelName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public ReplacementPartCategory getCategory() {
        return category;
    }

    // SETTER'lar
    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setCategory(ReplacementPartCategory category) {
        this.category = category;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
}

