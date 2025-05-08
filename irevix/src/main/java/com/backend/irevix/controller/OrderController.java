package com.backend.irevix.controller;

import com.backend.irevix.model.Order;
import com.backend.irevix.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/current")
    public ResponseEntity<List<Order>> getCurrentOrders(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        System.out.println("Email from JWT: " + email); // log ekle
        List<Order> orders = orderService.getCurrentOrders(email);
        System.out.println("Orders found: " + orders.size()); // log ekle
        return ResponseEntity.ok(orders);
    }


    @GetMapping("/past")
    public ResponseEntity<List<Order>> getPastOrders(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        return ResponseEntity.ok(orderService.getPastOrders(email));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order savedOrder = orderService.saveOrder(order);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return order != null
                ? new ResponseEntity<>(order, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
