package com.backend.irevix.service;

import com.backend.irevix.model.Cart;
import com.backend.irevix.model.CartItem;
import com.backend.irevix.model.ReplacementPart;
import com.backend.irevix.repository.CartItemRepository;
import com.backend.irevix.repository.CartRepository;
import com.backend.irevix.repository.ReplacementPartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepo;
    private final ReplacementPartRepository partRepo;
    private final CartItemRepository cartItemRepo;

    public CartService(CartRepository cartRepo,
                       ReplacementPartRepository partRepo,
                       CartItemRepository cartItemRepo) {
        this.cartRepo = cartRepo;
        this.partRepo = partRepo;
        this.cartItemRepo = cartItemRepo;
    }

    /**
     * Gets an existing cart for a user or creates a new one if none exists
     */
    public Cart getOrCreateCart(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be empty");
        }

        return cartRepo.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            return cartRepo.save(newCart);
        });
    }

    /**
     * Adds an item to the user's cart
     */
    @Transactional
    public Cart addItem(String userId, Long partId, int quantity, String type, String name, Double customPrice, String description) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be empty");
        }

        Cart cart = getOrCreateCart(userId);
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setQuantity(quantity > 0 ? quantity : 1);
        item.setType(type != null ? type.toLowerCase() : "part");

        if ("part".equalsIgnoreCase(type) && partId != null && partId > 0) {
            try {
                // This is a regular replacement part
                ReplacementPart part = partRepo.findById(partId)
                        .orElseThrow(() -> new RuntimeException("Part not found with ID: " + partId));

                item.setName(part.getName());
                item.setPrice(part.getPrice());
                item.setPart(part);
                item.setPartNumber(part.getPartNumber());
                item.setImageUrl(part.getImageUrl());
            } catch (Exception e) {
                // If replacement part lookup fails, use provided name and price if available
                System.err.println("Error finding replacement part: " + e.getMessage());
                if (name != null && customPrice != null) {
                    item.setName(name);
                    item.setPrice(customPrice);
                    // Don't set part reference
                } else {
                    throw new RuntimeException("Unable to add item to cart: " + e.getMessage());
                }
            }
        } else {
            // This is a service item or custom part or direct inventory item
            item.setName(name != null ? name : "Service Item");
            item.setPrice(customPrice != null ? customPrice : 100.0);
            item.setPartNumber(null);
            item.setImageUrl("https://source.unsplash.com/random/100x100/?tools");

            if (description != null && !description.trim().isEmpty()) {
                item.setDescription(description);
            }
        }

        cart.getItems().add(item);
        cartItemRepo.save(item);
        return cartRepo.save(cart);
    }

    /**
     * Simplified version for backward compatibility
     */
    @Transactional
    public Cart addItem(String userId, Long partId, int quantity, String type) {
        return addItem(userId, partId, quantity, type, null, null, null);
    }

    /**
     * Retrieves a user's cart
     */
    public Cart getCart(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be empty");
        }
        return getOrCreateCart(userId);
    }

    /**
     * Clears all items from a user's cart
     */
    @Transactional
    public void clearCart(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be empty");
        }

        Cart cart = getOrCreateCart(userId);
        cart.getItems().forEach(cartItemRepo::delete);
        cart.getItems().clear();
        cartRepo.save(cart);
    }

    /**
     * Removes a specific item from a cart
     */
    @Transactional
    public Cart removeItem(Long itemId) {
        if (itemId == null) {
            throw new IllegalArgumentException("Item ID cannot be null");
        }

        System.out.println("🧹 Trying to remove cart item: " + itemId);
        Optional<CartItem> itemOpt = cartItemRepo.findById(itemId);

        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            Cart cart = item.getCart();

            System.out.println("✅ Cart item found, removing from cart and deleting...");
            cart.getItems().remove(item);    // Remove from cart collection
            cartItemRepo.delete(item);       // Delete from database
            cartRepo.save(cart);             // Save updated cart
            return cart;                     // Return updated cart
        } else {
            System.out.println("❌ Cart item not found.");
            throw new RuntimeException("Cart item not found with ID: " + itemId);
        }
    }

    /**
     * Updates the quantity of an item in the cart
     */
    @Transactional
    public Cart updateQuantity(Long itemId, int newQty) {
        if (itemId == null) {
            throw new IllegalArgumentException("Item ID cannot be null");
        }

        if (newQty < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        CartItem item = cartItemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with ID: " + itemId));

        item.setQuantity(newQty);
        cartItemRepo.save(item);
        return item.getCart();
    }

    /**
     * Checks if a user's cart exists
     */
    public boolean cartExists(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }
        return cartRepo.findByUserId(userId).isPresent();
    }

    /**
     * Gets the total number of items in a user's cart
     */
    public int getCartItemCount(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return 0;
        }

        Cart cart = getOrCreateCart(userId);
        return cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }
}