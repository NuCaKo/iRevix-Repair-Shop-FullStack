package com.backend.irevix.controller;

import com.backend.irevix.model.ReplacementPart;
import com.backend.irevix.service.ReplacementPartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/replacement-parts")
@CrossOrigin(origins = "http://localhost:3000")
public class ReplacementPartController {

    private final ReplacementPartService service;

    public ReplacementPartController(ReplacementPartService service) {
        this.service = service;
    }

    // Belirli bir modele göre yedek parçaları getir
    @GetMapping("/model")
    public ResponseEntity<List<ReplacementPart>> getByModel(@RequestParam String model) {
        return ResponseEntity.ok(service.getPartsByModelName(model));
    }

    // Belirli bir parçanın stok miktarını azalt
    @PostMapping("/reduce-stock/{partId}")
    public ResponseEntity<String> reduceStock(
            @PathVariable Long partId,
            @RequestParam(defaultValue = "1") int quantity) {

        boolean success = service.reduceStock(partId, quantity);

        if (success) {
            return ResponseEntity.ok("Stok başarıyla azaltıldı");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Yetersiz stok");
        }
    }
}
