package com.backend.irevix.service;

import com.backend.irevix.model.Repair;
import com.backend.irevix.repository.RepairRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RepairService {

    private final RepairRepository repairRepository;

    @Autowired
    public RepairService(RepairRepository repairRepository) {
        this.repairRepository = repairRepository;
    }

    public List<Repair> getAllRepairs() {
        return repairRepository.findAllByOrderByDateDesc();
    }

    public Optional<Repair> getRepairById(Long id) {
        return repairRepository.findById(id);
    }

    public List<Repair> getRepairsByStatus(String status) {
        return repairRepository.findByStatus(status);
    }

    public List<Repair> getRepairsByCustomer(String customer) {
        return repairRepository.findByCustomer(customer);
    }

    public List<Repair> getRepairsByDevice(String device) {
        return repairRepository.findByDevice(device);
    }

    @Transactional
    public Repair createRepair(Repair repair) {
        if (repair.getRepairId() == null || repair.getRepairId().isEmpty()) {
            repair.setRepairId("RPR" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (repair.getDate() == null) {
            repair.setDate(LocalDate.now().toString());
        }
        repair.setUpdatedAt(new Date());
        return repairRepository.save(repair);
    }

    @Transactional
    public Repair updateRepair(Long id, Repair repairDetails) {
        Optional<Repair> optionalRepair = repairRepository.findById(id);
        if (optionalRepair.isPresent()) {
            Repair repair = optionalRepair.get();
            if (repairDetails.getCustomer() != null) {
                repair.setCustomer(repairDetails.getCustomer());
            }
            if (repairDetails.getDevice() != null) {
                repair.setDevice(repairDetails.getDevice());
            }
            if (repairDetails.getProblem() != null) {
                repair.setProblem(repairDetails.getProblem());
            }
            if (repairDetails.getStatus() != null) {
                repair.setStatus(repairDetails.getStatus());
            }

            repair.setUpdatedAt(new Date());
            return repairRepository.save(repair);
        }
        return null;
    }

    public void deleteRepair(Long id) {
        repairRepository.deleteById(id);
    }
}