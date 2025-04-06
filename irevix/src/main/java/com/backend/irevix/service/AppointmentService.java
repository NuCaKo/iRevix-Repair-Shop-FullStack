package com.backend.irevix.service;

import com.backend.irevix.model.Appointment;
import com.backend.irevix.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Tüm randevuları getir
    public List<Appointment> getAppointments() {
        return appointmentRepository.findAll();
    }
}
