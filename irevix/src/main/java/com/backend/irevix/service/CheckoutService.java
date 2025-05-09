package com.backend.irevix.service;

import com.backend.irevix.model.*;
import com.backend.irevix.repository.AppointmentRepository;
import com.backend.irevix.repository.OrderItemRepository;
import com.backend.irevix.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CheckoutService {

    private final CartService cartService;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final AppointmentRepository appointmentRepo;

    public CheckoutService(CartService cartService,
                           OrderRepository orderRepo,
                           OrderItemRepository orderItemRepo,
                           AppointmentRepository appointmentRepo) {
        this.cartService = cartService;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.appointmentRepo = appointmentRepo;
    }

    public Order checkout(String clerkUserId, String customerName) {
        Cart cart = cartService.getCart(clerkUserId);
        List<CartItem> items = cart.getItems();

        if (items.isEmpty()) {
            throw new IllegalStateException("Cart is empty. Cannot checkout.");
        }

        BigDecimal totalCost = items.stream()
                .map(item -> BigDecimal.valueOf(item.getPrice())
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Ürün isimlerini birleştir
        String productNames = items.stream()
                .map(CartItem::getName)
                .reduce((a, b) -> a + ", " + b)
                .orElse("Unknown Items");

        // Siparişi oluştur
        Order order = new Order();
        order.setClerkUserId(clerkUserId);
        order.setCustomerName(customerName);
        order.setDeviceType(productNames);
        order.setOrderDate(LocalDate.now());
        order.setEstimatedCompletion(LocalDate.now().plusDays(3));
        order.setStatus("Processing");
        order.setInvoiceNo("INV-" + System.currentTimeMillis());
        order.setCost(totalCost);

        // Issue bilgisi
        long partCount = items.stream().filter(i -> "part".equals(i.getType())).count();
        long serviceCount = items.stream().filter(i -> "service".equals(i.getType())).count();

        if (partCount > 0 && serviceCount > 0) {
            order.setIssue("Parts and Services");
        } else if (partCount > 0) {
            order.setIssue(partCount == 1 ? "1 Replacement Part" : partCount + " Replacement Parts");
        } else if (serviceCount > 0) {
            order.setIssue(serviceCount == 1 ? "1 Service" : serviceCount + " Services");
        } else {
            order.setIssue("Unknown Items");
        }

        // İlk service varsa appointmentDateTime'ı siparişe de yaz
        items.stream()
                .filter(i -> "service".equals(i.getType()) && i.getAppointmentDateTime() != null)
                .findFirst()
                .ifPresent(serviceItem -> order.setAppointmentDateTime(serviceItem.getAppointmentDateTime()));

        Order savedOrder = orderRepo.save(order);

        // Her bir ürün için OrderItem ve varsa Appointment oluştur
        for (CartItem item : items) {
            // OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setProductName(item.getName());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(item.getPrice());
            orderItem.setProductType(item.getType());
            orderItem.setOrder(savedOrder);
            orderItemRepo.save(orderItem);

            // Service için Appointment
            if ("service".equals(item.getType())) {
                Appointment appointment = new Appointment();
                appointment.setCustomerName(customerName);
                appointment.setCustomerEmail(item.getCustomerEmail());
                appointment.setCustomerPhone(item.getCustomerPhone());
                appointment.setDeviceType(item.getDeviceType());
                appointment.setDeviceModel(item.getDeviceModel());
                appointment.setIssueDescription(item.getName());
                appointment.setAppointmentDateTime(item.getAppointmentDateTime());
                appointment.setStatus("PENDING");
                appointmentRepo.save(appointment);
            }
        }

        cartService.clearCart(clerkUserId);
        return savedOrder;
    }
}
