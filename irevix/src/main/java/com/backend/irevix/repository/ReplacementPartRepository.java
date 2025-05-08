package com.backend.irevix.repository;

import com.backend.irevix.model.ReplacementPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;  // Add this import if needed

public interface ReplacementPartRepository extends JpaRepository<ReplacementPart, Long> {
    List<ReplacementPart> findByModelNameIgnoreCase(String modelName);
    Optional<ReplacementPart> findByPartNumber(String partNumber);  // Add this method
}