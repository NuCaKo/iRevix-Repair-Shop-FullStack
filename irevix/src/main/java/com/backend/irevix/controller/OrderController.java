package com.backend.irevix.controller;

import com.backend.irevix.model.Order;
import com.backend.irevix.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000") // Gerekirse
public class OrderController {
    @Autowired
    private OrderService orderService;

    @GetMapping("/{clerkUserId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable String clerkUserId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(clerkUserId));
    }
}

