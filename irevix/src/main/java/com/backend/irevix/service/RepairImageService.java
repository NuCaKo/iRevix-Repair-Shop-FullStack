package com.backend.irevix.service;

import com.backend.irevix.model.RepairImage;
import com.backend.irevix.repository.RepairImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RepairImageService {

    private final RepairImageRepository repairImageRepository;

    @Autowired
    public RepairImageService(RepairImageRepository repairImageRepository) {
        this.repairImageRepository = repairImageRepository;
    }

    // Görseli kaydetmek için metod
    public RepairImage saveRepairImage(RepairImage repairImage) {
        return repairImageRepository.save(repairImage); // Görseli veritabanına kaydeder
    }
}
