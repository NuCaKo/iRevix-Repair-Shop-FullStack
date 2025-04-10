package com.backend.irevix.service;

import com.backend.irevix.model.ReplacementPart;
import com.backend.irevix.repository.ReplacementPartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReplacementPartService {

    private final ReplacementPartRepository repository;

    public ReplacementPartService(ReplacementPartRepository repository) {
        this.repository = repository;
    }

    public List<ReplacementPart> getPartsByModelName(String modelName) {
        return repository.findByModelNameIgnoreCase(modelName);
    }

    public boolean reduceStock(Long partId, int quantity) {
        ReplacementPart part = repository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Parça bulunamadı"));

        if (part.getStockQuantity() >= quantity) {
            part.setStockQuantity(part.getStockQuantity() - quantity);
            repository.save(part);
            return true;
        } else {
            return false;
        }
    }
}
