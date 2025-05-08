package com.backend.irevix.controller;

import com.backend.irevix.model.Order;
import com.backend.irevix.service.CheckoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "http://localhost:3000")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<Order> checkout(@RequestParam String clerkUserId) {
        try {
            Order order = checkoutService.checkout(clerkUserId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
