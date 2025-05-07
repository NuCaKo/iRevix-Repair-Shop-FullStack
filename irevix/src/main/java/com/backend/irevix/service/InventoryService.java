package com.backend.irevix.service;

import com.backend.irevix.model.Inventory;
import com.backend.irevix.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Autowired
    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<Inventory> getAllInventoryItems() {
        return inventoryRepository.findAll();
    }

    public Optional<Inventory> getInventoryItemById(Long id) {
        return inventoryRepository.findById(id);
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public List<Inventory> getCriticalLowStockItems() {
        try {
            return inventoryRepository.findCriticalLowStockItems();
        } catch (Exception e) {
            // If the query method doesn't exist or fails, fall back to manual filtering
            System.err.println("Error finding critical low stock items: " + e.getMessage());
            return inventoryRepository.findAll().stream()
                    .filter(item -> item.getStockLevel() <= item.getReorderPoint() * 0.5)
                    .collect(Collectors.toList());
        }
    }

    public List<Inventory> getInventoryItemsByDeviceAndModel(String deviceType, String modelType) {
        try {
            // Try case-insensitive search first
            List<Inventory> items = inventoryRepository.findByDeviceTypeIgnoreCaseAndModelTypeIgnoreCase(
                    deviceType.toLowerCase(), modelType);

            // If not found, try with partial model matching
            if (items.isEmpty()) {
                try {
                    items = inventoryRepository.findByDeviceTypeAndModelTypeContaining(
                            deviceType.toLowerCase(), modelType);
                } catch (Exception e) {
                    System.err.println("Error with flexible model search: " + e.getMessage());
                    // Fall back to the original method if the new one doesn't exist
                    items = inventoryRepository.findByDeviceTypeAndModelType(deviceType.toLowerCase(), modelType);
                }
            }

            return items;
        } catch (Exception e) {
            System.err.println("Error finding inventory by device and model: " + e.getMessage());
            // Fall back to the original method if the enhanced ones don't exist
            return inventoryRepository.findByDeviceTypeAndModelType(deviceType, modelType);
        }
    }

    public List<Inventory> getInventoryItemsByDevice(String deviceType) {
        try {
            return inventoryRepository.findByDeviceTypeIgnoreCase(deviceType.toLowerCase());
        } catch (Exception e) {
            System.err.println("Error finding inventory by device (case insensitive): " + e.getMessage());
            // Fall back to the original method if the enhanced one doesn't exist
            return inventoryRepository.findByDeviceType(deviceType);
        }
    }

    @Transactional
    public Inventory createInventoryItem(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory updateInventoryItem(Long id, Inventory inventory) {
        inventory.setId(id);
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory restockInventoryItem(Long id, int quantity) {
        Optional<Inventory> optionalInventory = inventoryRepository.findById(id);
        if (optionalInventory.isPresent()) {
            Inventory inventory = optionalInventory.get();
            inventory.setStockLevel(inventory.getStockLevel() + quantity);
            inventory.setLastRestocked(LocalDate.now().toString());
            return inventoryRepository.save(inventory);
        }
        return null;
    }

    public void deleteInventoryItem(Long id) {
        inventoryRepository.deleteById(id);
    }
}