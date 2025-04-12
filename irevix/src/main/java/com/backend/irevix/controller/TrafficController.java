package com.backend.irevix.controller;

import com.backend.irevix.model.Traffic;
import com.backend.irevix.service.TrafficService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traffic")
public class TrafficController {

    private final TrafficService trafficService;

    @Autowired
    public TrafficController(TrafficService trafficService) {
        this.trafficService = trafficService;
    }
    @GetMapping
    public ResponseEntity<List<Traffic>> getTrafficByPeriod(
            @RequestParam(required = false, defaultValue = "7days") String period
    ) {
        List<Traffic> trafficData = trafficService.getTrafficByPeriod(period);
        return ResponseEntity.ok(trafficData);
    }
    @PostMapping
    public ResponseEntity<Traffic> createTrafficRecord(@RequestBody Traffic traffic) {
        Traffic createdTraffic = trafficService.createTrafficRecord(traffic);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTraffic);
    }
    @PostMapping("/bulk")
    public ResponseEntity<List<Traffic>> createTrafficRecords(@RequestBody List<Traffic> trafficRecords) {
        List<Traffic> savedTrafficRecords = trafficService.saveAllTrafficRecords(trafficRecords);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTrafficRecords);
    }
}