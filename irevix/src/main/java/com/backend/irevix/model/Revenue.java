package com.backend.irevix.model;

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
}