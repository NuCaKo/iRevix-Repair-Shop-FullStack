package com.backend.irevix.controller;

import com.backend.irevix.model.Order;
import com.backend.irevix.service.CheckoutService;
import com.backend.irevix.service.RevenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "http://localhost:3000")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final RevenueService revenueService;

    public CheckoutController(CheckoutService checkoutService, RevenueService revenueService) {
        this.checkoutService = checkoutService;
        this.revenueService = revenueService;
    }

    // Eski metot - Artık kullanmıyoruz ama geriye dönük uyumluluk için tutuyoruz
    @PostMapping(params = "clerkUserId")
    public ResponseEntity<Order> checkoutWithParams(
            @RequestParam String clerkUserId,
            @RequestParam(required = false, defaultValue = "") String firstName,
            @RequestParam(required = false, defaultValue = "") String lastName) {
        try {
            String customerName = (firstName + " " + lastName).trim();
            Order order = checkoutService.checkout(clerkUserId, customerName);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Yeni JSON tabanlı metot
    @PostMapping
    public ResponseEntity<Order> checkout(@RequestBody CheckoutRequest request) {
        try {
            // Siparişi oluştur
            Order order = checkoutService.checkout(request.getClerkUserId(), request.getCustomerName());

            // Revenue verilerini güncelle
            revenueService.updateRevenue(request.getItems());

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // İstek modeli için iç sınıflar
    public static class CheckoutRequest {
        private String clerkUserId;
        private String customerName;
        private List<ItemRequest> items;
        private double totalAmount;

        // Getter ve setter metodları
        public String getClerkUserId() {
            return clerkUserId;
        }

        public void setClerkUserId(String clerkUserId) {
            this.clerkUserId = clerkUserId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public List<ItemRequest> getItems() {
            return items;
        }

        public void setItems(List<ItemRequest> items) {
            this.items = items;
        }

        public double getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(double totalAmount) {
            this.totalAmount = totalAmount;
        }
    }

    public static class ItemRequest {
        private String type;
        private String name;
        private String deviceType;
        private double price;
        private int quantity;

        // Getter ve setter metodları
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDeviceType() {
            return deviceType;
        }

        public void setDeviceType(String deviceType) {
            this.deviceType = deviceType;
        }

        public double getPrice() {
            return price;
        }

        public void setPrice(double price) {
            this.price = price;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }
}