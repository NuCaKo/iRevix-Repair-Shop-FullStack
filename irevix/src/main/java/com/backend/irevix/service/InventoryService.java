package com.backend.irevix.service;

import com.backend.irevix.model.Inventory;
import com.backend.irevix.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    // Tüm envanteri listelemek için
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // ID'ye göre bir envanter parçası almak için
    public Optional<Inventory> getInventoryById(Long id) {
        return inventoryRepository.findById(id);
    }

    // Yeni bir envanter parçası eklemek için
    public Inventory addInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    // Mevcut bir envanter parçasını güncellemek için
    public Inventory updateInventory(Long id, Inventory updatedInventory) {
        Optional<Inventory> existingInventory = inventoryRepository.findById(id);

        if (existingInventory.isPresent()) {
            Inventory inventory = existingInventory.get();
            inventory.setName(updatedInventory.getName());
            inventory.setBrand(updatedInventory.getBrand());
            inventory.setStock(updatedInventory.getStock());
            inventory.setStatus(updatedInventory.getStatus());
            inventory.setLocation(updatedInventory.getLocation());
            inventory.setCategory(updatedInventory.getCategory());
            inventory.setQuantity(updatedInventory.getQuantity());
            inventory.setPrice(updatedInventory.getPrice());

            return inventoryRepository.save(inventory);
        }
        return null;  // Eğer ID bulunamazsa, null döneceğiz
    }

    // Bir envanter parçasını silmek için
    public boolean deleteInventory(Long id) {
        Optional<Inventory> existingInventory = inventoryRepository.findById(id);

        if (existingInventory.isPresent()) {
            inventoryRepository.delete(existingInventory.get());
            return true;  // Başarılı bir şekilde silindi
        }
        return false;  // Envanter parçası bulunamadı
    }

    // Kategorisine göre envanter parçalarını listelemek için
    public List<Inventory> getInventoryByCategory(String category) {
        return inventoryRepository.findByCategory(category);
    }

    // Stok durumuna göre envanter parçalarını listelemek için
    public List<Inventory> getInventoryByStatus(String status) {
        return inventoryRepository.findByStatus(status);
    }

    // Fiyat aralığına göre envanter parçalarını listelemek için
    public List<Inventory> getInventoryByPriceRange(Double minPrice, Double maxPrice) {
        return inventoryRepository.findByPriceBetween(minPrice, maxPrice);
    }
}
