package com.backend.irevix.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String icon;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeviceModel> models;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PartCategory> partCategories;
    public void addDeviceModel(DeviceModel model) {
        models.add(model);
        model.setDevice(this);
    }

    public void removeDeviceModel(DeviceModel model) {
        models.remove(model);
        model.setDevice(null);
    }

    public void addPartCategory(PartCategory category) {
        partCategories.add(category);
        category.setDevice(this);
    }

    public void removePartCategory(PartCategory category) {
        partCategories.remove(category);
        category.setDevice(null);
    }
}