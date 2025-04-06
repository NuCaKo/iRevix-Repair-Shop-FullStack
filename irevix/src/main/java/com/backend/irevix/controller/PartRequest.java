package com.backend.irevix.model;

public class PartRequest {

    private Long partId;  // Parçanın ID'si
    private int quantity; // Talep edilen miktar
    private String urgency; // Talep aciliyeti


    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }
}
