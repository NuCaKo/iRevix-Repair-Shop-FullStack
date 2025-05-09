package com.backend.irevix.service;

import com.backend.irevix.model.Cart;
import com.backend.irevix.model.CartItem;
import com.backend.irevix.model.Order;
import com.backend.irevix.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CheckoutService {

    private final CartService cartService;
    private final OrderRepository orderRepo;

    public CheckoutService(CartService cartService, OrderRepository orderRepo) {
        this.cartService = cartService;
        this.orderRepo = orderRepo;
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
        // Müşteri adını ayarla
        order.setCustomerName(customerName);
        order.setOrderDate(LocalDate.now());
        order.setEstimatedCompletion(LocalDate.now().plusDays(3));
        order.setStatus("Processing");
        order.setDeviceType("Mixed Items"); // opsiyonel
        order.setIssue("Multi-item checkout");
        order.setCost(totalCost);
        order.setInvoiceNo("INV-" + System.currentTimeMillis());

        Order savedOrder = orderRepo.save(order);

        cartService.clearCart(clerkUserId);

        return savedOrder;
    }
}