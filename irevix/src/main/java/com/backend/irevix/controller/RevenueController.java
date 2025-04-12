package com.backend.irevix.controller;

import com.backend.irevix.model.Revenue;
import com.backend.irevix.service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {

    private final RevenueService revenueService;

    @Autowired
    public RevenueController(RevenueService revenueService) {
        this.revenueService = revenueService;
    }
    @GetMapping("/{period}")
    public ResponseEntity<Revenue> getRevenueByPeriod(@PathVariable String period) {
        try {
            Optional<Revenue> revenue = revenueService.getRevenueByPeriod(period);

            if (revenue.isPresent()) {
                return ResponseEntity.ok(revenue.get());
            } else {
                Revenue defaultRevenue = new Revenue();
                defaultRevenue.setPeriod(period);
                defaultRevenue.setToday(0);
                defaultRevenue.setThisWeek(0);
                defaultRevenue.setThisMonth(0);
                defaultRevenue.setLastMonth(0);
                defaultRevenue.setPeriodLabel(period);
                defaultRevenue.setRepairSalesRatio("0:0");
                defaultRevenue.setTodayChange("0%");
                defaultRevenue.setWeekChange("0%");
                defaultRevenue.setMonthChange("0%");
                defaultRevenue.setDailyRevenue(new ArrayList<>());
                defaultRevenue.setDeviceRevenue(new ArrayList<>());
                defaultRevenue.setRepairsByType(new ArrayList<>());

                return ResponseEntity.ok(defaultRevenue);
            }
        } catch (Exception e) {
            System.err.println("Error in revenue controller: " + e.getMessage());
            e.printStackTrace();
            Revenue errorRevenue = new Revenue();
            errorRevenue.setPeriod(period);
            errorRevenue.setPeriodLabel(period);
            errorRevenue.setDailyRevenue(new ArrayList<>());
            errorRevenue.setDeviceRevenue(new ArrayList<>());
            errorRevenue.setRepairsByType(new ArrayList<>());

            return ResponseEntity.ok(errorRevenue);
        }
    }
    @GetMapping
    public ResponseEntity<Revenue> getRevenue(
            @RequestParam(required = false, defaultValue = "7days") String period
    ) {
        return getRevenueByPeriod(period);
    }
    @PostMapping
    public ResponseEntity<Revenue> createOrUpdateRevenue(@RequestBody Revenue revenue) {
        try {
            Revenue savedRevenue = revenueService.createOrUpdateRevenue(revenue);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRevenue);
        } catch (Exception e) {
            System.err.println("Error creating or updating revenue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}