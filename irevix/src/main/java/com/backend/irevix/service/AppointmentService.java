package com.backend.irevix.service;

import com.backend.irevix.model.Appointment;
import com.backend.irevix.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getTodayAppointments() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay(); // 2025-04-08 00:00:00
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX); // 2025-04-08 23:59:59.999999999

        System.out.println("Start: " + startOfDay);
        System.out.println("End: " + endOfDay);

        return appointmentRepository.findByAppointmentDateTimeBetween(startOfDay, endOfDay);
    }

}
