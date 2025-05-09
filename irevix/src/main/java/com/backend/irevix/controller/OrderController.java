package com.backend.irevix.controller;

import com.backend.irevix.model.Order;
import com.backend.irevix.service.OrderService;
import com.backend.irevix.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository; // Add this field

    @GetMapping("/{clerkUserId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable String clerkUserId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(clerkUserId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();

            // Update fields if they're provided
            if (orderDetails.getStatus() != null) {
                order.setStatus(orderDetails.getStatus());
            }
            if (orderDetails.getIssue() != null) {
                order.setIssue(orderDetails.getIssue());
            }
            // Add other fields as needed

            Order updatedOrder = orderRepository.save(order);
            return ResponseEntity.ok(updatedOrder);
        }
        return ResponseEntity.notFound().build();
    }
}