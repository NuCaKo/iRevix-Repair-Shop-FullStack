package com.backend.irevix.controller;



import com.backend.irevix.model.Appointment;
import com.backend.irevix.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    public List<Appointment> getAppointments() {
        return appointmentService.getAppointments();
    }
}