package com.backend.irevix.controller;

import com.backend.irevix.model.RepairServiceOption;
import com.backend.irevix.service.RepairServiceOptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/service-options")
public class RepairServiceOptionController {

    private final RepairServiceOptionService repairServiceOptionService;

    @Autowired
    public RepairServiceOptionController(RepairServiceOptionService repairServiceOptionService) {
        this.repairServiceOptionService = repairServiceOptionService;
    }

    @GetMapping
    public ResponseEntity<List<RepairServiceOption>> getAllServiceOptions(
            @RequestParam(required = false) Long serviceTypeId,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        List<RepairServiceOption> serviceOptions;

        if (serviceTypeId != null && activeOnly != null && activeOnly) {
            serviceOptions = repairServiceOptionService.getActiveServiceOptionsByType(serviceTypeId);
        } else if (serviceTypeId != null) {
            serviceOptions = repairServiceOptionService.getServiceOptionsByType(serviceTypeId);
        } else {
            serviceOptions = repairServiceOptionService.getAllServiceOptions();
        }

        return ResponseEntity.ok(serviceOptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairServiceOption> getServiceOptionById(@PathVariable Long id) {
        Optional<RepairServiceOption> serviceOption = repairServiceOptionService.getServiceOptionById(id);
        return serviceOption.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RepairServiceOption> createServiceOption(@RequestBody RepairServiceOption serviceOption) {
        RepairServiceOption createdServiceOption = repairServiceOptionService.createServiceOption(serviceOption);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdServiceOption);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepairServiceOption> updateServiceOption(
            @PathVariable Long id,
            @RequestBody RepairServiceOption serviceOptionDetails) {
        RepairServiceOption updatedServiceOption = repairServiceOptionService.updateServiceOption(id, serviceOptionDetails);
        if (updatedServiceOption != null) {
            return ResponseEntity.ok(updatedServiceOption);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceOption(@PathVariable Long id) {
        repairServiceOptionService.deleteServiceOption(id);
        return ResponseEntity.noContent().build();
    }
}