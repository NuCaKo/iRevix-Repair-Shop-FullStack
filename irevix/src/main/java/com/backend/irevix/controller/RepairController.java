package com.backend.irevix.controller;

import com.backend.irevix.model.Repair;
import com.backend.irevix.service.RepairService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    private final RepairService repairService;

    @Autowired
    public RepairController(RepairService repairService) {
        this.repairService = repairService;
    }

    // Get all repairs
    @GetMapping
    public ResponseEntity<List<Repair>> getAllRepairs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String customer,
            @RequestParam(required = false) String device
    ) {
        List<Repair> repairs;
        if (status != null) {
            repairs = repairService.getRepairsByStatus(status);
        } else if (customer != null) {
            repairs = repairService.getRepairsByCustomer(customer);
        } else if (device != null) {
            repairs = repairService.getRepairsByDevice(device);
        } else {
            repairs = repairService.getAllRepairs();
        }
        return ResponseEntity.ok(repairs);
    }

    // Get repair by ID
    @GetMapping("/{id}")
    public ResponseEntity<Repair> getRepairById(@PathVariable Long id) {
        Optional<Repair> repair = repairService.getRepairById(id);
        return repair.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new repair
    @PostMapping
    public ResponseEntity<Repair> createRepair(@RequestBody Repair repair) {
        Repair createdRepair = repairService.createRepair(repair);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRepair);
    }

    // Update an existing repair
    @PutMapping("/{id}")
    public ResponseEntity<Repair> updateRepair(
            @PathVariable Long id,
            @RequestBody Repair repairDetails) {
        Repair updatedRepair = repairService.updateRepair(id, repairDetails);
        if (updatedRepair != null) {
            return ResponseEntity.ok(updatedRepair);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a repair
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepair(@PathVariable Long id) {
        repairService.deleteRepair(id);
        return ResponseEntity.noContent().build();
    }
}