package com.backend.irevix.controller;

import com.backend.irevix.model.Inventory;
import com.backend.irevix.model.InventoryUpdateRequest;
import com.backend.irevix.model.ReplacementPart;
import com.backend.irevix.repository.ReplacementPartRepository;
import com.backend.irevix.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*") // Add this if CORS is an issue
public class InventoryController {

    private final InventoryService inventoryService;
    private final ReplacementPartRepository replacementPartRepository;

    @Autowired
    public InventoryController(InventoryService inventoryService,
                               ReplacementPartRepository replacementPartRepository) {
        this.inventoryService = inventoryService;
        this.replacementPartRepository = replacementPartRepository;
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventoryItems(
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) String modelType,
            @RequestParam(required = false) Boolean lowStock
    ) {
        // Log the incoming parameters for debugging
        System.out.println("Request params - deviceType: " + deviceType + ", modelType: " + modelType + ", lowStock: " + lowStock);

        List<Inventory> items;

        // Handle low stock parameter
        if (lowStock != null && lowStock) {
            items = inventoryService.getLowStockItems();
            System.out.println("Fetching low stock items: " + items.size() + " found");
            return ResponseEntity.ok(items);
        }

        // Handle device and model filtering
        if (deviceType != null && modelType != null) {
            // Normalize deviceType to lowercase for case-insensitive search
            String normalizedDeviceType = deviceType.toLowerCase();
            System.out.println("Normalized deviceType: " + normalizedDeviceType);

            // Try exact match first
            items = inventoryService.getInventoryItemsByDeviceAndModel(normalizedDeviceType, modelType);

            // If no results, try case-insensitive search
            if (items.isEmpty()) {
                System.out.println("No exact match found, trying case-insensitive search");
                items = inventoryService.getAllInventoryItems().stream()
                        .filter(item -> item.getDeviceType().toLowerCase().equals(normalizedDeviceType) &&
                                item.getModelType().equalsIgnoreCase(modelType))
                        .collect(Collectors.toList());
            }

            // If still no results, try partial matching (contains logic)
            if (items.isEmpty()) {
                System.out.println("No case-insensitive match found, trying partial matching");
                items = inventoryService.getAllInventoryItems().stream()
                        .filter(item -> item.getDeviceType().toLowerCase().contains(normalizedDeviceType.toLowerCase()) &&
                                item.getModelType().toLowerCase().contains(modelType.toLowerCase()))
                        .collect(Collectors.toList());
            }

            System.out.println("Found " + items.size() + " items for device: " + deviceType + ", model: " + modelType);
        } else if (deviceType != null) {
            String normalizedDeviceType = deviceType.toLowerCase();
            items = inventoryService.getInventoryItemsByDevice(normalizedDeviceType);
            System.out.println("Found " + items.size() + " items for device: " + deviceType);
        } else {
            items = inventoryService.getAllInventoryItems();
            System.out.println("Returning all " + items.size() + " items");
        }

        return ResponseEntity.ok(items);
    }

    @GetMapping("/fallback")
    public ResponseEntity<List<Inventory>> getFallbackInventory(
            @RequestParam String deviceType,
            @RequestParam String modelType
    ) {
        System.out.println("Fallback search for deviceType: " + deviceType + ", modelType: " + modelType);

        String normalizedDeviceType = deviceType.toLowerCase();

        // Use a more flexible search approach
        List<Inventory> items = inventoryService.getAllInventoryItems().stream()
                .filter(item -> {
                    boolean deviceMatch = item.getDeviceType().toLowerCase().contains(normalizedDeviceType) ||
                            normalizedDeviceType.contains(item.getDeviceType().toLowerCase());

                    boolean modelMatch = item.getModelType().toLowerCase().contains(modelType.toLowerCase()) ||
                            modelType.toLowerCase().contains(item.getModelType().toLowerCase());

                    return deviceMatch && modelMatch;
                })
                .collect(Collectors.toList());

        System.out.println("Fallback search found " + items.size() + " items");
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryItemById(@PathVariable Long id) {
        Optional<Inventory> item = inventoryService.getInventoryItemById(id);
        return item.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Inventory> createInventoryItem(@RequestBody Inventory inventory) {
        Inventory createdItem = inventoryService.createInventoryItem(inventory);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventoryItem(
            @PathVariable Long id,
            @RequestBody Inventory inventoryDetails) {
        Inventory updatedItem = inventoryService.updateInventoryItem(id, inventoryDetails);
        return ResponseEntity.ok(updatedItem);
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryItem(@PathVariable Long id) {
        inventoryService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/to-replacement-part")
    public ResponseEntity<?> convertToReplacementPart(@RequestParam Long inventoryId) {
        try {
            Optional<Inventory> inventoryOpt = inventoryService.getInventoryItemById(inventoryId);

            if (!inventoryOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Inventory item not found with ID: " + inventoryId);
            }

            Inventory inventory = inventoryOpt.get();

            // Create and save a new replacement part based on inventory
            ReplacementPart part = new ReplacementPart();
            part.setName(inventory.getName());
            part.setPartNumber(inventory.getPartNumber());
            part.setPrice(inventory.getPrice());
            part.setDescription(inventory.getDescription());
            part.setModelName(inventory.getModelType());
            part.setStockQuantity(inventory.getStockLevel());

            // Use the injected repository directly
            System.out.println("Creating new replacement part for: " + inventory.getName());
            ReplacementPart saved = replacementPartRepository.save(part);
            System.out.println("Successfully created replacement part with ID: " + saved.getId());

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace(); // Important: Log the full stack trace
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error converting to replacement part: " + e.getMessage());
        }
    }

    /**
     * Update inventory stock level when items are added to cart
     */
    /**
     * Update inventory stock level when items are added to cart
     */
    @PostMapping("/update")
    public ResponseEntity<?> updateInventory(@RequestBody InventoryUpdateRequest request) {
        try {
            System.out.println("InventoryController.updateInventory - Request received: " + request);

            // Validate the request
            if (request.getPartId() == null || request.getDecreaseAmount() <= 0) {
                System.out.println("Invalid request parameters: partId=" + request.getPartId() +
                        ", decreaseAmount=" + request.getDecreaseAmount());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid request parameters");
                return ResponseEntity.badRequest().body(response);
            }

            try {
                // Use the dedicated decreaseStock method that ensures immediate persistence
                Inventory updatedInventory = inventoryService.decreaseStock(
                        request.getPartId(),
                        request.getDecreaseAmount()
                );

                System.out.println("Inventory updated successfully through dedicated method: " +
                        updatedInventory.getName() + ", new stock level: " + updatedInventory.getStockLevel());

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Inventory updated successfully");
                response.put("newStockLevel", updatedInventory.getStockLevel());
                response.put("itemName", updatedInventory.getName());

                return ResponseEntity.ok(response);
            } catch (RuntimeException e) {
                // If the item is not found or there's not enough stock, handle it
                if (e.getMessage().contains("not found")) {
                    System.out.println("Inventory item not found, checking if it's a replacement part...");
                } else if (e.getMessage().contains("Not enough stock")) {
                    System.out.println("Not enough inventory stock: " + e.getMessage());
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", e.getMessage());
                    return ResponseEntity.badRequest().body(response);
                } else {
                    // For other errors, throw through
                    throw e;
                }
            }

            // If inventory update failed due to not found, try ReplacementPart
            Optional<ReplacementPart> partOptional = replacementPartRepository.findById(request.getPartId());

            if (partOptional.isEmpty()) {
                System.out.println("Part not found in either Inventory or ReplacementPart: ID=" + request.getPartId());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Part not found in inventory or replacement parts");
                return ResponseEntity.badRequest().body(response);
            }

            ReplacementPart part = partOptional.get();
            System.out.println("Found replacement part: " + part.getName() +
                    ", current stock: " + part.getStockQuantity());

            // Check if there's enough stock
            if (part.getStockQuantity() < request.getDecreaseAmount()) {
                System.out.println("Not enough stock available. Requested: " + request.getDecreaseAmount() +
                        ", Available: " + part.getStockQuantity());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", String.format("Not enough stock. Only %d units available.", part.getStockQuantity()));
                return ResponseEntity.badRequest().body(response);
            }

            // Update the stock level
            int oldStock = part.getStockQuantity();
            part.setStockQuantity(oldStock - request.getDecreaseAmount());
            ReplacementPart updatedPart = replacementPartRepository.saveAndFlush(part);

            System.out.println("Replacement part updated successfully: " + updatedPart.getName() +
                    ", new stock level: " + updatedPart.getStockQuantity() +
                    " (was " + oldStock + ")");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Replacement part inventory updated successfully");
            response.put("oldStockLevel", oldStock);
            response.put("newStockLevel", updatedPart.getStockQuantity());
            response.put("itemName", updatedPart.getName());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating inventory: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating inventory: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}