package com.backend.irevix.service;

import com.backend.irevix.model.Inventory;
import com.backend.irevix.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    public List<Inventory> getInventoryItemsByDeviceAndModel(String deviceType, String modelType) {
        return inventoryRepository.findByDeviceTypeAndModelType(deviceType, modelType);
    }

    public List<Inventory> getInventoryItemsByDevice(String deviceType) {
        return inventoryRepository.findByDeviceType(deviceType);
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