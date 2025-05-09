package com.backend.irevix.service;

import com.backend.irevix.model.Order;
import com.backend.irevix.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    public List<Order> getOrdersByUserId(String clerkUserId) {
        return orderRepository.findByClerkUserId(clerkUserId);
    }
}