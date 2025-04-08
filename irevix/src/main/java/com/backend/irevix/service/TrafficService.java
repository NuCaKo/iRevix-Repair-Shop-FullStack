package com.backend.irevix.service;

import com.backend.irevix.model.Traffic;
import com.backend.irevix.repository.TrafficRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TrafficService {

    private final TrafficRepository trafficRepository;

    @Autowired
    public TrafficService(TrafficRepository trafficRepository) {
        this.trafficRepository = trafficRepository;
    }

    public List<Traffic> getTrafficByPeriod(String period) {
        return trafficRepository.findByPeriodOrderByDateAsc(period);
    }

    @Transactional
    public Traffic createTrafficRecord(Traffic traffic) {
        return trafficRepository.save(traffic);
    }

    @Transactional
    public List<Traffic> saveAllTrafficRecords(List<Traffic> trafficRecords) {
        return trafficRepository.saveAll(trafficRecords);
    }
}