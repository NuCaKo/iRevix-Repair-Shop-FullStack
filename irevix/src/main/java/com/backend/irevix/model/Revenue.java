package com.backend.irevix.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "revenue")
public class Revenue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String period; // today, 7days, 30days, 90days

    private double today;
    private double thisWeek;

    @Column(name = "this_month")
    private double thisMonth;

    @Column(name = "last_month")
    private double lastMonth;

    @Column(name = "period_label")
    private String periodLabel;

    @Column(name = "today_change")
    private String todayChange;

    @Column(name = "week_change")
    private String weekChange;

    @Column(name = "month_change")
    private String monthChange;

    @Column(name = "repair_sales_ratio")
    private String repairSalesRatio;

    @Column(name = "ratio_change")
    private String ratioChange;

    @OneToMany(mappedBy = "revenue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DailyRevenue> dailyRevenue = new ArrayList<>();

    @OneToMany(mappedBy = "revenue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DeviceRevenue> deviceRevenue = new ArrayList<>();

    @OneToMany(mappedBy = "revenue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<RepairType> repairsByType = new ArrayList<>();

    @Temporal(TemporalType.TIMESTAMP)
    private Date date;

    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = new Date();
        }
    }

    @Entity
    @Table(name = "daily_revenue")
    @Data
    public static class DailyRevenue {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "revenue_id")
        @JsonIgnore
        private Revenue revenue;

        @Column(nullable = false)
        private String date;

        private double sales;
        private double repairs;
        private double total;
    }

    @Entity
    @Table(name = "device_revenue")
    @Data
    public static class DeviceRevenue {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "revenue_id")
        @JsonIgnore
        private Revenue revenue;

        private String device;

        // Use a different field name to avoid conflicts
        @Column(name = "revenue")
        private double revenueValue;

        @Column(name = "revenue_amount")
        private double revenueAmount;

        private double percentage;
    }

    @Entity
    @Table(name = "repair_types")
    @Data
    public static class RepairType {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "revenue_id")
        @JsonIgnore
        private Revenue revenue;

        private String type;
        private int count;

        // Use a different field name to avoid conflicts
        @Column(name = "revenue")
        private double revenueValue;

        @Column(name = "revenue_amount")
        private double revenueAmount;
    }
}