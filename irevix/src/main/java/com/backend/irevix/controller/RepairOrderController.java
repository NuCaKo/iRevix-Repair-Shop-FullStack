package com.backend.irevix.controller;

import com.backend.irevix.model.RepairOrder;
import com.backend.irevix.service.RepairOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repair-orders")
@CrossOrigin(origins = "*") // For development only, specify actual origins in production
public class RepairOrderController {

    private final RepairOrderService repairOrderService;

    @Autowired
    public RepairOrderController(RepairOrderService repairOrderService) {
        this.repairOrderService = repairOrderService;
    }

    @GetMapping
    public List<RepairOrder> getAllRepairOrders() {
        return repairOrderService.getAllRepairOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepairOrder> getRepairOrderById(@PathVariable Long id) {
        return repairOrderService.getRepairOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RepairOrder createRepairOrder(@RequestBody RepairOrder repairOrder) {
        return repairOrderService.saveRepairOrder(repairOrder);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepairOrder> updateRepairOrder(
            @PathVariable Long id, @RequestBody RepairOrder repairOrder) {
        if (!repairOrderService.getRepairOrderById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        repairOrder.setId(id);
        return ResponseEntity.ok(repairOrderService.saveRepairOrder(repairOrder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepairOrder(@PathVariable Long id) {
        if (!repairOrderService.getRepairOrderById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        repairOrderService.deleteRepairOrder(id);
        return ResponseEntity.noContent().build();
    }
}