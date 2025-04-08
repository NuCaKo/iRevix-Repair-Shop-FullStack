package com.backend.irevix.controller;

import com.backend.irevix.model.DeviceModel;
import com.backend.irevix.service.DeviceModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/device-models")
public class DeviceModelController {

    private final DeviceModelService deviceModelService;

    @Autowired
    public DeviceModelController(DeviceModelService deviceModelService) {
        this.deviceModelService = deviceModelService;
    }

    // Get all device models
    @GetMapping
    public ResponseEntity<List<DeviceModel>> getAllDeviceModels() {
        List<DeviceModel> deviceModels = deviceModelService.getAllDeviceModels();
        return ResponseEntity.ok(deviceModels);
    }

    // Get device models by device ID
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<DeviceModel>> getDeviceModelsByDeviceId(@PathVariable Long deviceId) {
        List<DeviceModel> deviceModels = deviceModelService.getDeviceModelsByDeviceId(deviceId);
        return ResponseEntity.ok(deviceModels);
    }

    // Get a specific device model by ID
    @GetMapping("/{id}")
    public ResponseEntity<DeviceModel> getDeviceModelById(@PathVariable Long id) {
        Optional<DeviceModel> deviceModel = deviceModelService.getDeviceModelById(id);
        return deviceModel.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new device model
    @PostMapping
    public ResponseEntity<DeviceModel> createDeviceModel(@RequestBody DeviceModel deviceModel) {
        DeviceModel createdDeviceModel = deviceModelService.createDeviceModel(deviceModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDeviceModel);
    }

    // Update an existing device model
    @PutMapping("/{id}")
    public ResponseEntity<DeviceModel> updateDeviceModel(
            @PathVariable Long id,
            @RequestBody DeviceModel deviceModelDetails) {
        DeviceModel updatedDeviceModel = deviceModelService.updateDeviceModel(id, deviceModelDetails);

        if (updatedDeviceModel != null) {
            return ResponseEntity.ok(updatedDeviceModel);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a device model
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeviceModel(@PathVariable Long id) {
        deviceModelService.deleteDeviceModel(id);
        return ResponseEntity.noContent().build();
    }
}