package com.backend.irevix.controller;


import com.backend.irevix.model.Technician;
import com.backend.irevix.service.TechnicianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    @Autowired
    private TechnicianService technicianService;

    @GetMapping
    public List<Technician> getTechnicians() {
        return technicianService.getTechnicians();
    }
}


