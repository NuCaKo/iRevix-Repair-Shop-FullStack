package com.backend.irevix.service;

import com.backend.irevix.model.Order;
import com.backend.irevix.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getCurrentOrders(String email) {
        return orderRepository.findByEmailAndStatusNot(email, "Completed");
    }

    public List<Order> getPastOrders(String email) {
        return orderRepository.findByEmailAndStatus(email, "Completed");
    }

    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    public Order getOrderById(Long id) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        return optionalOrder.orElse(null);
    }
}