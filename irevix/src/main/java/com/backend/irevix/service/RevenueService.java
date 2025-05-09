package com.backend.irevix.service;

import com.backend.irevix.controller.CheckoutController.ItemRequest;
import com.backend.irevix.model.DailyRevenue;
import com.backend.irevix.model.DeviceRevenue;
import com.backend.irevix.model.RepairType;
import com.backend.irevix.model.Revenue;
import com.backend.irevix.repository.RevenueRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Transactional
    public void updateRevenue(List<ItemRequest> items) {
        try {
            // Günlük gelirleri güncelle
            updateDailyRevenue(items);

            // Cihaz türüne göre gelirleri güncelle
            updateDeviceRevenue(items);

            // Tamir türüne göre gelirleri güncelle
            updateRepairTypeRevenue(items);

            // Bugünün toplam gelirini aylık ve haftalık revenue'larda güncelle
            updatePeriodTotals();

            System.out.println("Revenue data updated successfully from checkout");
        } catch (Exception e) {
            System.err.println("Error updating revenue data: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void updateDailyRevenue(List<ItemRequest> items) {
        // Bugünün tarihi
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

        // Servis ve parça gelirlerini hesapla
        double salesAmount = items.stream()
                .filter(item -> "part".equals(item.getType()))
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        double repairsAmount = items.stream()
                .filter(item -> "service".equals(item.getType()))
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        double totalAmount = salesAmount + repairsAmount;

        // Bugünün revenue kaydını al
        Optional<Revenue> todayRevenueOpt = revenueRepository.findByPeriod("today");
        if (todayRevenueOpt.isPresent()) {
            Revenue todayRevenue = todayRevenueOpt.get();

            // Today revenue'yu güncelle
            todayRevenue.setToday(todayRevenue.getToday() + totalAmount);

            // Daily revenue'yu güncelle
            List<DailyRevenue> dailyRevenueList = todayRevenue.getDailyRevenue();
            boolean updated = false;

            for (DailyRevenue dr : dailyRevenueList) {
                if (dr.getDate().equals(today)) {
                    dr.setSales(dr.getSales() + salesAmount);
                    dr.setRepairs(dr.getRepairs() + repairsAmount);
                    dr.setTotal(dr.getTotal() + totalAmount);
                    updated = true;
                    break;
                }
            }

            // Eğer bugün için kayıt yoksa, yeni bir kayıt oluştur
            if (!updated) {
                DailyRevenue newDr = new DailyRevenue();
                newDr.setDate(today);
                newDr.setSales(salesAmount);
                newDr.setRepairs(repairsAmount);
                newDr.setTotal(totalAmount);
                dailyRevenueList.add(newDr);
            }

            // Repair to sales oranını güncelle
            updateRepairSalesRatio(todayRevenue);

            revenueRepository.save(todayRevenue);
        } else {
            // Bugün için kayıt yoksa, yeni bir kayıt oluştur
            Revenue newRevenue = new Revenue();
            newRevenue.setPeriod("today");
            newRevenue.setToday(totalAmount);
            newRevenue.setThisWeek(totalAmount);
            newRevenue.setThisMonth(totalAmount);
            newRevenue.setPeriodLabel("Today");

            List<DailyRevenue> dailyRevenueList = new ArrayList<>();
            DailyRevenue dr = new DailyRevenue();
            dr.setDate(today);
            dr.setSales(salesAmount);
            dr.setRepairs(repairsAmount);
            dr.setTotal(totalAmount);
            dailyRevenueList.add(dr);

            newRevenue.setDailyRevenue(dailyRevenueList);

            // Repair to sales oranını ayarla
            if (salesAmount > 0 || repairsAmount > 0) {
                int salesPct = (int) Math.round((salesAmount / totalAmount) * 100);
                int repairsPct = 100 - salesPct;
                newRevenue.setRepairSalesRatio(repairsPct + ":" + salesPct);
            } else {
                newRevenue.setRepairSalesRatio("0:0");
            }

            revenueRepository.save(newRevenue);
        }

        // 7-günlük revenue kaydını da güncelle
        Optional<Revenue> weekRevenueOpt = revenueRepository.findByPeriod("7days");
        if (weekRevenueOpt.isPresent()) {
            Revenue weekRevenue = weekRevenueOpt.get();

            // Haftalık toplamı güncelle
            weekRevenue.setThisWeek(weekRevenue.getThisWeek() + totalAmount);

            // Daily revenue'yu güncelle
            List<DailyRevenue> dailyRevenueList = weekRevenue.getDailyRevenue();
            boolean updated = false;

            for (DailyRevenue dr : dailyRevenueList) {
                if (dr.getDate().equals(today)) {
                    dr.setSales(dr.getSales() + salesAmount);
                    dr.setRepairs(dr.getRepairs() + repairsAmount);
                    dr.setTotal(dr.getTotal() + totalAmount);
                    updated = true;
                    break;
                }
            }

            // Eğer bugün için kayıt yoksa, yeni bir kayıt oluştur
            if (!updated) {
                DailyRevenue newDr = new DailyRevenue();
                newDr.setDate(today);
                newDr.setSales(salesAmount);
                newDr.setRepairs(repairsAmount);
                newDr.setTotal(totalAmount);
                dailyRevenueList.add(newDr);
            }

            // Repair to sales oranını güncelle
            updateRepairSalesRatio(weekRevenue);

            revenueRepository.save(weekRevenue);
        }
    }

    private void updateDeviceRevenue(List<ItemRequest> items) {
        // Cihaz türüne göre gelir dağılımını hesapla
        Map<String, Double> deviceRevenues = new HashMap<>();

        for (ItemRequest item : items) {
            String deviceType = item.getDeviceType();
            if (deviceType == null || deviceType.isEmpty()) {
                deviceType = "Other";
            }

            double amount = item.getPrice() * item.getQuantity();
            deviceRevenues.put(deviceType, deviceRevenues.getOrDefault(deviceType, 0.0) + amount);
        }

        // Bugünün ve haftalık revenue kayıtlarını güncelle
        updateDeviceRevenueForPeriod("today", deviceRevenues);
        updateDeviceRevenueForPeriod("7days", deviceRevenues);
    }

    private void updateDeviceRevenueForPeriod(String period, Map<String, Double> deviceRevenues) {
        Optional<Revenue> revenueOpt = revenueRepository.findByPeriod(period);
        if (revenueOpt.isPresent()) {
            Revenue revenue = revenueOpt.get();
            List<DeviceRevenue> deviceRevenueList = revenue.getDeviceRevenue();

            // Her cihaz türü için mevcut kayıtları güncelle veya yeni kayıt ekle
            for (Map.Entry<String, Double> entry : deviceRevenues.entrySet()) {
                String deviceType = entry.getKey();
                double amount = entry.getValue();

                boolean updated = false;
                for (DeviceRevenue dr : deviceRevenueList) {
                    if (dr.getDevice().equals(deviceType)) {
                        dr.setRevenueValue(dr.getRevenueValue() + amount);
                        dr.setRevenueAmount(dr.getRevenueAmount() + amount);
                        updated = true;
                        break;
                    }
                }

                if (!updated) {
                    DeviceRevenue newDr = new DeviceRevenue();
                    newDr.setDevice(deviceType);
                    newDr.setRevenueValue(amount);
                    newDr.setRevenueAmount(amount);
                    newDr.setPercentage(0.0); // Yüzde daha sonra hesaplanacak
                    deviceRevenueList.add(newDr);
                }
            }

            // Yüzdeleri yeniden hesapla
            updateDeviceRevenuePercentages(deviceRevenueList);

            revenueRepository.save(revenue);
        }
    }

    private void updateDeviceRevenuePercentages(List<DeviceRevenue> deviceRevenueList) {
        double totalRevenue = deviceRevenueList.stream()
                .mapToDouble(DeviceRevenue::getRevenueAmount)
                .sum();

        if (totalRevenue > 0) {
            for (DeviceRevenue dr : deviceRevenueList) {
                dr.setPercentage((dr.getRevenueAmount() / totalRevenue) * 100);
            }
        }
    }

    private void updateRepairTypeRevenue(List<ItemRequest> items) {
        // Sadece servis tipindeki öğeleri filtrele
        List<ItemRequest> serviceItems = items.stream()
                .filter(item -> "service".equals(item.getType()))
                .collect(Collectors.toList());

        if (serviceItems.isEmpty()) {
            return; // Servis öğesi yoksa işlem yapma
        }

        // Tamir türüne göre gelir dağılımını hesapla
        Map<String, List<ItemRequest>> repairTypeMap = new HashMap<>();

        for (ItemRequest item : serviceItems) {
            String repairType = item.getName();
            if (!repairTypeMap.containsKey(repairType)) {
                repairTypeMap.put(repairType, new ArrayList<>());
            }

            repairTypeMap.get(repairType).add(item);
        }

        // Bugünün ve haftalık revenue kayıtlarını güncelle
        updateRepairTypeRevenueForPeriod("today", repairTypeMap);
        updateRepairTypeRevenueForPeriod("7days", repairTypeMap);
    }

    private void updateRepairTypeRevenueForPeriod(String period, Map<String, List<ItemRequest>> repairTypeMap) {
        Optional<Revenue> revenueOpt = revenueRepository.findByPeriod(period);
        if (revenueOpt.isPresent()) {
            Revenue revenue = revenueOpt.get();
            List<RepairType> repairTypeList = revenue.getRepairsByType();

            // Her tamir türü için mevcut kayıtları güncelle veya yeni kayıt ekle
            for (Map.Entry<String, List<ItemRequest>> entry : repairTypeMap.entrySet()) {
                String repairTypeName = entry.getKey();
                List<ItemRequest> items = entry.getValue();

                int count = items.size();
                double amount = items.stream()
                        .mapToDouble(item -> item.getPrice() * item.getQuantity())
                        .sum();

                boolean updated = false;
                for (RepairType rt : repairTypeList) {
                    if (rt.getType().equals(repairTypeName)) {
                        rt.setCount(rt.getCount() + count);
                        rt.setRevenueValue(rt.getRevenueValue() + amount);
                        rt.setRevenueAmount(rt.getRevenueAmount() + amount);
                        updated = true;
                        break;
                    }
                }

                if (!updated) {
                    RepairType newRt = new RepairType();
                    newRt.setType(repairTypeName);
                    newRt.setCount(count);
                    newRt.setRevenueValue(amount);
                    newRt.setRevenueAmount(amount);
                    repairTypeList.add(newRt);
                }
            }

            revenueRepository.save(revenue);
        }
    }

    private void updatePeriodTotals() {
        // Bugünün gelirini diğer periyotlarda güncelle
        Optional<Revenue> todayRevenueOpt = revenueRepository.findByPeriod("today");
        if (todayRevenueOpt.isPresent()) {
            Revenue todayRevenue = todayRevenueOpt.get();
            double todayAmount = todayRevenue.getToday();

            // 7 günlük revenue'yu güncelle
            Optional<Revenue> weekRevenueOpt = revenueRepository.findByPeriod("7days");
            if (weekRevenueOpt.isPresent()) {
                Revenue weekRevenue = weekRevenueOpt.get();
                weekRevenue.setThisWeek(weekRevenue.getThisWeek() + todayAmount);
                revenueRepository.save(weekRevenue);
            }

            // 30 günlük revenue'yu güncelle
            Optional<Revenue> monthRevenueOpt = revenueRepository.findByPeriod("30days");
            if (monthRevenueOpt.isPresent()) {
                Revenue monthRevenue = monthRevenueOpt.get();
                monthRevenue.setThisMonth(monthRevenue.getThisMonth() + todayAmount);
                revenueRepository.save(monthRevenue);
            }
        }
    }

    private void updateRepairSalesRatio(Revenue revenue) {
        List<DailyRevenue> dailyRevenueList = revenue.getDailyRevenue();

        double totalSales = dailyRevenueList.stream().mapToDouble(DailyRevenue::getSales).sum();
        double totalRepairs = dailyRevenueList.stream().mapToDouble(DailyRevenue::getRepairs).sum();
        double total = totalSales + totalRepairs;

        if (total > 0) {
            int repairsPct = (int) Math.round((totalRepairs / total) * 100);
            int salesPct = 100 - repairsPct;
            revenue.setRepairSalesRatio(repairsPct + ":" + salesPct);
        } else {
            revenue.setRepairSalesRatio("0:0");
        }
    }
}