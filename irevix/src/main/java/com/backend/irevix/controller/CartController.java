package com.backend.irevix.controller;

import com.backend.irevix.model.Cart;
import com.backend.irevix.model.Inventory;
import com.backend.irevix.service.CartService;
import com.backend.irevix.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;
    private final InventoryService inventoryService;

    @Autowired
    public CartController(CartService cartService, InventoryService inventoryService) {
        this.cartService = cartService;
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<Cart> getCartByRequestParam(@RequestParam String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(
            @RequestParam String userId,
            @RequestParam Long partId,
            @RequestParam(defaultValue = "1") int quantity,
            @RequestParam(defaultValue = "part") String type,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) String description) {

        return ResponseEntity.ok(cartService.addItem(userId, partId, quantity, type, name, price, description));
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Cart> removeItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(itemId));
    }

    @PutMapping("/quantity/{itemId}")
    public ResponseEntity<Cart> updateQuantity(@PathVariable Long itemId, @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(itemId, quantity));
    }

    @PostMapping("/add-inventory")
    public ResponseEntity<Cart> addInventoryToCart(
            @RequestParam String userId,
            @RequestParam Long inventoryId,
            @RequestParam(defaultValue = "1") int quantity) {

        try {
            System.out.println("Adding inventory item directly to cart - userId: " + userId +
                    ", inventoryId: " + inventoryId + ", quantity: " + quantity);

            // Get the inventory item
            Optional<Inventory> inventoryOpt = inventoryService.getInventoryItemById(inventoryId);

            if (!inventoryOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Inventory inventory = inventoryOpt.get();

            // Add to cart using name and price (no part entity)
            Cart updatedCart = cartService.addItem(
                    userId,
                    null,
                    quantity,
                    "part",
                    inventory.getName(),
                    inventory.getPrice(),
                    inventory.getDescription()
            );

            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            System.err.println("Error in addInventoryToCart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}