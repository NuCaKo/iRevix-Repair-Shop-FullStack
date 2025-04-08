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

    List<Inventory> findByDeviceTypeAndModelType(String deviceType, String modelType);

    List<Inventory> findByDeviceType(String deviceType);
}