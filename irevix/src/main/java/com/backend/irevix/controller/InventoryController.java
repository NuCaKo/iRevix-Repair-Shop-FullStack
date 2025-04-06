package com.backend.irevix.controller;

import com.backend.irevix.model.Inventory;
import com.backend.irevix.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/{id}")
    public Optional<Inventory> getInventoryById(@PathVariable Long id) {
        return inventoryService.getInventoryById(id);
    }

    @PostMapping
    public Inventory addInventory(@RequestBody Inventory inventory) {
        return inventoryService.addInventory(inventory);
    }

    @PutMapping("/{id}")
    public Inventory updateInventory(@PathVariable Long id, @RequestBody Inventory updatedInventory) {
        return inventoryService.updateInventory(id, updatedInventory);
    }

    @DeleteMapping("/{id}")
    public boolean deleteInventory(@PathVariable Long id) {
        return inventoryService.deleteInventory(id);
    }

    @GetMapping("/category/{category}")
    public List<Inventory> getInventoryByCategory(@PathVariable String category) {
        return inventoryService.getInventoryByCategory(category);
    }

    @GetMapping("/status/{status}")
    public List<Inventory> getInventoryByStatus(@PathVariable String status) {
        return inventoryService.getInventoryByStatus(status);
    }

    @GetMapping("/price-range")
    public List<Inventory> getInventoryByPriceRange(@RequestParam Double minPrice, @RequestParam Double maxPrice) {
        return inventoryService.getInventoryByPriceRange(minPrice, maxPrice);
    }
}
