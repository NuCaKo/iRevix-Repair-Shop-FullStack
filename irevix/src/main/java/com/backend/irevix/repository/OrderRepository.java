package com.backend.irevix.repository;

import com.backend.irevix.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Find orders by customer ID
    List<Order> findByClerkUserId(String clerkUserId);

    // Find orders by status
    List<Order> findByStatus(String status);

    // Find orders by device type
    List<Order> findByDeviceType(String deviceType);

    // Find orders by date range
    List<Order> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);

    // Find orders created on a specific date
    List<Order> findByOrderDate(LocalDate orderDate);

    // Find orders by customer name (for searching)
    List<Order> findByCustomerNameContainingIgnoreCase(String customerName);

    // Find all orders sorted by date (newest first)
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findAllOrderByOrderDateDesc();

    // Find orders by status ordered by date
    @Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.orderDate DESC")
    List<Order> findByStatusOrderByOrderDateDesc(@Param("status") String status);

    // Count orders by status
    long countByStatus(String status);

    // Find latest orders (limit results)
    @Query(value = "SELECT * FROM orders ORDER BY order_date DESC LIMIT :limit", nativeQuery = true)
    List<Order> findLatestOrders(@Param("limit") int limit);

    // Find orders needing attention (pending, in progress)
    @Query("SELECT o FROM Order o WHERE o.status IN ('Pending', 'In Progress') ORDER BY o.orderDate ASC")
    List<Order> findOrdersNeedingAttention();

    // Find orders created today
    @Query("SELECT o FROM Order o WHERE o.orderDate = CURRENT_DATE")
    List<Order> findOrdersCreatedToday();
}