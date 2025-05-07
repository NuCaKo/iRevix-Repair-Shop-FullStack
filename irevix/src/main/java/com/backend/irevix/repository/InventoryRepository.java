package com.backend.irevix.repository;

import com.backend.irevix.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query("SELECT i FROM Inventory i WHERE i.stockLevel <= i.reorderPoint")
    List<Inventory> findLowStockItems();

    // Original methods
    List<Inventory> findByDeviceTypeAndModelType(String deviceType, String modelType);
    List<Inventory> findByDeviceType(String deviceType);

    // New case-insensitive methods
    List<Inventory> findByDeviceTypeIgnoreCase(String deviceType);

    List<Inventory> findByDeviceTypeIgnoreCaseAndModelTypeIgnoreCase(String deviceType, String modelType);

    // Find inventory with flexible model matching
    @Query("SELECT i FROM Inventory i WHERE LOWER(i.deviceType) = LOWER(:deviceType) AND LOWER(i.modelType) LIKE LOWER(CONCAT('%', :modelType, '%'))")
    List<Inventory> findByDeviceTypeAndModelTypeContaining(String deviceType, String modelType);

    // Find critically low stock (below 50% of reorder point)
    @Query("SELECT i FROM Inventory i WHERE i.stockLevel <= (i.reorderPoint * 0.5)")
    List<Inventory> findCriticalLowStockItems();
}