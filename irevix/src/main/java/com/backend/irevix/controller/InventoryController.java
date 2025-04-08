package com.backend.irevix.controller;

import com.backend.irevix.model.Inventory;
import com.backend.irevix.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @Autowired
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Get all inventory items
    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventoryItems(
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String modelType
    ) {
        List<Inventory> items;
        if (deviceType != null && modelType != null) {
            items = inventoryService.getInventoryItemsByDeviceAndModel(deviceType, modelType);
        } else if (deviceType != null) {
            items = inventoryService.getInventoryItemsByDevice(deviceType);
        } else {
            items = inventoryService.getAllInventoryItems();
        }
        return ResponseEntity.ok(items);
    }

    // Get low stock items
    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStockItems() {
        List<Inventory> lowStockItems = inventoryService.getLowStockItems();
        return ResponseEntity.ok(lowStockItems);
    }

    // Get inventory item by ID
    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryItemById(@PathVariable Long id) {
        Optional<Inventory> item = inventoryService.getInventoryItemById(id);
        return item.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new inventory item
    @PostMapping
    public ResponseEntity<Inventory> createInventoryItem(@RequestBody Inventory inventory) {
        Inventory createdItem = inventoryService.createInventoryItem(inventory);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    // Update an existing inventory item
    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventoryItem(
            @PathVariable Long id,
            @RequestBody Inventory inventoryDetails) {
        Inventory updatedItem = inventoryService.updateInventoryItem(id, inventoryDetails);
        return ResponseEntity.ok(updatedItem);
    }

    // Restock an inventory item
    @PatchMapping("/{id}/restock")
    public ResponseEntity<Inventory> restockInventoryItem(
            @PathVariable Long id,
            @RequestParam int quantity) {
        Inventory restockedItem = inventoryService.restockInventoryItem(id, quantity);
        if (restockedItem != null) {
            return ResponseEntity.ok(restockedItem);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete an inventory item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryItem(@PathVariable Long id) {
        inventoryService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }
}