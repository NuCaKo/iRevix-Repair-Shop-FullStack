package com.backend.irevix.model;

/**
 * Request model for updating inventory stock levels
 */
public class InventoryUpdateRequest {
    private Long partId;
    private int decreaseAmount;

    // Constructors
    public InventoryUpdateRequest() {
    }

    public InventoryUpdateRequest(Long partId, int decreaseAmount) {
        this.partId = partId;
        this.decreaseAmount = decreaseAmount;
    }

    // Getters and setters
    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public int getDecreaseAmount() {
        return decreaseAmount;
    }

    public void setDecreaseAmount(int decreaseAmount) {
        this.decreaseAmount = decreaseAmount;
    }

    @Override
    public String toString() {
        return "InventoryUpdateRequest{" +
                "partId=" + partId +
                ", decreaseAmount=" + decreaseAmount +
                '}';
    }
}