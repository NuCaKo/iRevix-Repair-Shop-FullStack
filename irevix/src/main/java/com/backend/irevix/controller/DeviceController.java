package com.backend.irevix.controller;

import com.backend.irevix.model.Device;
import com.backend.irevix.service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;

    @Autowired
    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }
    @GetMapping
    public ResponseEntity<List<Device>> getAllDevices() {
        List<Device> devices = deviceService.getAllDevices();
        return ResponseEntity.ok(devices);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Device> getDeviceById(@PathVariable Long id) {
        Optional<Device> device = deviceService.getDeviceById(id);
        return device.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/name/{name}")
    public ResponseEntity<Device> getDeviceByName(@PathVariable String name) {
        Optional<Device> device = deviceService.getDeviceByName(name);
        return device.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getDevicesWithModels() {
        Map<String, Object> devicesWithModels = deviceService.getDevicesWithModels();
        return ResponseEntity.ok(devicesWithModels);
    }
    @PostMapping
    public ResponseEntity<Device> createDevice(@RequestBody Device device) {
        Device createdDevice = deviceService.createOrUpdateDevice(device);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDevice);
    }
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncDevices(@RequestBody Map<String, List<Device>> requestBody) {
        List<Device> devices = requestBody.get("devices");
        if (devices == null || devices.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid input. Devices should be a non-empty array."));
        }

        List<Device> updatedDevices = deviceService.createOrUpdateDevices(devices);

        Map<String, Object> response = Map.of(
                "message", "Devices synced successfully",
                "devices", updatedDevices
        );

        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Device> updateDevice(
            @PathVariable Long id,
            @RequestBody Device deviceDetails) {
        deviceDetails.setId(id);
        Device updatedDevice = deviceService.createOrUpdateDevice(deviceDetails);
        return ResponseEntity.ok(updatedDevice);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}