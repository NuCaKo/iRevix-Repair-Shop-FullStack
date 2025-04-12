package com.backend.irevix.service;

import com.backend.irevix.model.Revenue;
import com.backend.irevix.repository.RevenueRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class RevenueService {

    private final RevenueRepository revenueRepository;

    @Autowired
    public RevenueService(RevenueRepository revenueRepository) {
        this.revenueRepository = revenueRepository;
    }

    @Transactional(readOnly = true)
    public Optional<Revenue> getRevenueByPeriod(String period) {
        try {
            Optional<Revenue> revenueOpt = revenueRepository.findByPeriod(period);

            if (revenueOpt.isPresent()) {
                Revenue revenue = revenueOpt.get();
                if (revenue.getDailyRevenue() != null) {
                    Hibernate.initialize(revenue.getDailyRevenue());
                }

                if (revenue.getDeviceRevenue() != null) {
                    Hibernate.initialize(revenue.getDeviceRevenue());
                }

                if (revenue.getRepairsByType() != null) {
                    Hibernate.initialize(revenue.getRepairsByType());
                }

                return Optional.of(revenue);
            }

            return revenueOpt;
        } catch (Exception e) {
            System.err.println("Error fetching revenue data: " + e.getMessage());
            e.printStackTrace();
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

            return Optional.of(defaultRevenue);
        }
    }
    @Transactional
    public Revenue createOrUpdateRevenue(Revenue revenue) {
        return revenueRepository.save(revenue);
    }
}