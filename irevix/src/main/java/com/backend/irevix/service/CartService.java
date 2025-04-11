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

    public Cart getOrCreateCart(String userId) {
        return cartRepo.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            return cartRepo.save(newCart);
        });
    }

    @Transactional
    public Cart addItem(String userId, Long partId, int quantity, String type) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setQuantity(quantity);
        item.setType(type);

        if ("part".equalsIgnoreCase(type)) {
            ReplacementPart part = partRepo.findById(partId).orElseThrow(() -> new RuntimeException("Parça bulunamadı"));
            item.setName(part.getName());
            item.setPrice(part.getPrice());
            item.setPart(part);
            item.setPartNumber(part.getPartNumber());
            item.setImageUrl(part.getImageUrl());
        } else {
            item.setName("Service Item");
            item.setPrice(100.0); // örnek fiyat
            item.setPartNumber(null);
            item.setImageUrl("https://source.unsplash.com/random/100x100/?tools");
        }

        cart.getItems().add(item);
        cartItemRepo.save(item); // önemli!
        return cartRepo.save(cart);
    }

    public Cart getCart(String userId) {
        return getOrCreateCart(userId);
    }

    public void clearCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().forEach(cartItemRepo::delete);
        cart.getItems().clear();
        cartRepo.save(cart);
    }

    @Transactional
    public Cart removeItem(Long itemId) {
        System.out.println("🧹 Trying to remove cart item: " + itemId);
        Optional<CartItem> itemOpt = cartItemRepo.findById(itemId);
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            Cart cart = item.getCart();

            System.out.println("✅ Cart item found, removing from cart and deleting...");
            cart.getItems().remove(item);         // Cart içinden çıkar
            cartItemRepo.delete(item);            // Veritabanından sil
            cartRepo.save(cart);                  // Güncellenmiş cart'ı kaydet
            return cart;                          // Güncellenmiş cart dön
        } else {
            System.out.println("❌ Cart item not found.");
            throw new RuntimeException("Item not found");
        }
    }


    @Transactional
    public Cart updateQuantity(Long itemId, int newQty) {
        CartItem item = cartItemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        item.setQuantity(newQty);
        cartItemRepo.save(item);
        return item.getCart();
    }
}
