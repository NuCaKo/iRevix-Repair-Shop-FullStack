package com.backend.irevix.repository;

import com.backend.irevix.model.Inventory;  // Inventory sınıfını import et
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findAll();

    // Parça adını aramak için
    List<Inventory> findByName(String name);

    // Kategorisine göre parça aramak için
    List<Inventory> findByCategory(String category);

    // Stok durumu ile parçaları almak için
    List<Inventory> findByStatus(String status);

    // Fiyat aralığına göre parçaları almak için
    List<Inventory> findByPriceBetween(Double minPrice, Double maxPrice);

    // Part ID'sine göre Inventory'yi almak için
    Optional<Inventory> findById(Long id);
}
