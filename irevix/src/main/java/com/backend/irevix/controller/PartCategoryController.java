package com.backend.irevix.controller;

import com.backend.irevix.model.PartCategory;
import com.backend.irevix.service.PartCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/part-categories")
public class PartCategoryController {

    private final PartCategoryService partCategoryService;

    @Autowired
    public PartCategoryController(PartCategoryService partCategoryService) {
        this.partCategoryService = partCategoryService;
    }

    // Get all part categories
    @GetMapping
    public ResponseEntity<List<PartCategory>> getAllPartCategories() {
        List<PartCategory> partCategories = partCategoryService.getAllPartCategories();
        return ResponseEntity.ok(partCategories);
    }

    // Get part categories by device ID
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<PartCategory>> getPartCategoriesByDeviceId(@PathVariable Long deviceId) {
        List<PartCategory> partCategories = partCategoryService.getPartCategoriesByDeviceId(deviceId);
        return ResponseEntity.ok(partCategories);
    }

    // Get a specific part category by ID
    @GetMapping("/{id}")
    public ResponseEntity<PartCategory> getPartCategoryById(@PathVariable Long id) {
        Optional<PartCategory> partCategory = partCategoryService.getPartCategoryById(id);
        return partCategory.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new part category
    @PostMapping
    public ResponseEntity<PartCategory> createPartCategory(@RequestBody PartCategory partCategory) {
        PartCategory createdPartCategory = partCategoryService.createPartCategory(partCategory);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPartCategory);
    }

    // Update an existing part category
    @PutMapping("/{id}")
    public ResponseEntity<PartCategory> updatePartCategory(
            @PathVariable Long id,
            @RequestBody PartCategory partCategoryDetails) {
        PartCategory updatedPartCategory = partCategoryService.updatePartCategory(id, partCategoryDetails);

        if (updatedPartCategory != null) {
            return ResponseEntity.ok(updatedPartCategory);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a part category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartCategory(@PathVariable Long id) {
        partCategoryService.deletePartCategory(id);
        return ResponseEntity.noContent().build();
    }
}