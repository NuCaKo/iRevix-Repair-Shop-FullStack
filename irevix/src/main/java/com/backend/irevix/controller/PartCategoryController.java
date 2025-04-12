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
    @GetMapping
    public ResponseEntity<List<PartCategory>> getAllPartCategories() {
        List<PartCategory> partCategories = partCategoryService.getAllPartCategories();
        return ResponseEntity.ok(partCategories);
    }
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<PartCategory>> getPartCategoriesByDeviceId(@PathVariable Long deviceId) {
        List<PartCategory> partCategories = partCategoryService.getPartCategoriesByDeviceId(deviceId);
        return ResponseEntity.ok(partCategories);
    }
    @GetMapping("/{id}")
    public ResponseEntity<PartCategory> getPartCategoryById(@PathVariable Long id) {
        Optional<PartCategory> partCategory = partCategoryService.getPartCategoryById(id);
        return partCategory.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<PartCategory> createPartCategory(@RequestBody PartCategory partCategory) {
        PartCategory createdPartCategory = partCategoryService.createPartCategory(partCategory);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPartCategory);
    }
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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartCategory(@PathVariable Long id) {
        partCategoryService.deletePartCategory(id);
        return ResponseEntity.noContent().build();
    }
}