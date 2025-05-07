package com.backend.irevix.controller;

import com.backend.irevix.model.RepairServiceType;
import com.backend.irevix.service.RepairServiceTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/service-types")
public class RepairServiceTypeController {

    private final RepairServiceTypeService repairServiceTypeService;

    @Autowired
    public RepairServiceTypeController(RepairServiceTypeService repairServiceTypeService) {
        this.repairServiceTypeService = repairServiceTypeService;
    }

    @GetMapping
    public ResponseEntity<List<RepairServiceType>> getAllServiceTypes(
            @RequestParam(required = false) String deviceType,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        List<RepairServiceType> serviceTypes;

        if (deviceType != null && activeOnly != null && activeOnly) {
            serviceTypes = repairServiceTypeService.getActiveServiceTypesByDevice(deviceType);
        } else if (deviceType != null) {
            serviceTypes = repairServiceTypeService.getServiceTypesByDevice(deviceType);
        } else if (activeOnly != null && activeOnly) {
            serviceTypes = repairServiceTypeService.getActiveServiceTypes();
        } else {
            serviceTypes = repairServiceTypeService.getAllServiceTypes();
        }

        return ResponseEntity.ok(serviceTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairServiceType> getServiceTypeById(@PathVariable Long id) {
        Optional<RepairServiceType> serviceType = repairServiceTypeService.getServiceTypeById(id);
        return serviceType.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RepairServiceType> createServiceType(@RequestBody RepairServiceType serviceType) {
        RepairServiceType createdServiceType = repairServiceTypeService.createServiceType(serviceType);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdServiceType);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepairServiceType> updateServiceType(
            @PathVariable Long id,
            @RequestBody RepairServiceType serviceTypeDetails) {
        RepairServiceType updatedServiceType = repairServiceTypeService.updateServiceType(id, serviceTypeDetails);
        if (updatedServiceType != null) {
            return ResponseEntity.ok(updatedServiceType);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceType(@PathVariable Long id) {
        repairServiceTypeService.deleteServiceType(id);
        return ResponseEntity.noContent().build();
    }
}