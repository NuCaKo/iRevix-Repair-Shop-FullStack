package com.backend.irevix.service;

import com.backend.irevix.model.Technician;
import com.backend.irevix.repository.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechnicianService {

    @Autowired
    private TechnicianRepository technicianRepository;

    // Tüm teknikerleri getir
    public List<Technician> getTechnicians() {
        return technicianRepository.findAll();
    }
}
