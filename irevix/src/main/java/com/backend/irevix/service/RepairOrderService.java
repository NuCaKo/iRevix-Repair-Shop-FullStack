package com.backend.irevix.service;

import com.backend.irevix.model.RepairOrder;
import com.backend.irevix.repository.RepairOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RepairOrderService {

    private final RepairOrderRepository repairOrderRepository;

    @Autowired
    public RepairOrderService(RepairOrderRepository repairOrderRepository) {
        this.repairOrderRepository = repairOrderRepository;
    }

    public List<RepairOrder> getAllRepairOrders() {
        return repairOrderRepository.findAll();
    }

    public Optional<RepairOrder> getRepairOrderById(Long id) {
        return repairOrderRepository.findById(id);
    }

    public RepairOrder saveRepairOrder(RepairOrder repairOrder) {
        return repairOrderRepository.save(repairOrder);
    }

    public void deleteRepairOrder(Long id) {
        repairOrderRepository.deleteById(id);
    }
}