package com.backend.irevix.service;

import com.backend.irevix.model.*;
import com.backend.irevix.repository.OrderRepository;
import com.backend.irevix.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CheckoutService {

    private final CartService cartService;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;

    public CheckoutService(CartService cartService, OrderRepository orderRepo, OrderItemRepository orderItemRepo) {
        this.cartService = cartService;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
    }

    public Order checkout(String clerkUserId, String customerName) {
        Cart cart = cartService.getCart(clerkUserId);
        List<CartItem> items = cart.getItems();

        if (items.isEmpty()) {
            throw new IllegalStateException("Cart is empty. Cannot checkout.");
        }

        BigDecimal totalCost = items.stream()
                .map(item -> BigDecimal.valueOf(item.getPrice()).multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setClerkUserId(clerkUserId);
        order.setCustomerName(customerName);
        order.setOrderDate(LocalDate.now());
        order.setEstimatedCompletion(LocalDate.now().plusDays(3));
        order.setStatus("Processing");
        String productNames = items.stream()
                .map(CartItem::getName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("Unknown Items");
        order.setDeviceType(productNames);

        long partCount = items.stream().filter(item -> "part".equals(item.getType())).count();
        long serviceCount = items.stream().filter(item -> "service".equals(item.getType())).count();


        String issue;
        if (partCount > 0 && serviceCount > 0) {
            issue = "Parts and Services";
        } else if (partCount > 0) {
            issue = partCount == 1 ? "1 Replacement Part" : partCount + " Replacement Parts";
        } else if (serviceCount > 0) {
            issue = serviceCount == 1 ? "1 Service" : serviceCount + " Services";
        } else {
            issue = "Unknown Items";
        }

        order.setIssue(issue);




        order.setCost(totalCost);
        order.setInvoiceNo("INV-" + System.currentTimeMillis());

        Order savedOrder = orderRepo.save(order);


        for (CartItem item : items) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProductName(item.getName());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(item.getPrice());
            orderItem.setProductType(item.getType());
            orderItem.setOrder(savedOrder);
            orderItemRepo.save(orderItem);
        }

        cartService.clearCart(clerkUserId);

        return savedOrder;
    }
}
