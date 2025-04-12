package com.backend.irevix.controller;

import com.backend.irevix.model.Cart;
import com.backend.irevix.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
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
            @RequestParam(defaultValue = "part") String type) {
        return ResponseEntity.ok(cartService.addItem(userId, partId, quantity, type));
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
}
