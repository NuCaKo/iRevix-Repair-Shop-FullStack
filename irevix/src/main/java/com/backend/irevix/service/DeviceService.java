package com.backend.irevix.service;

import com.backend.irevix.model.Device;
import com.backend.irevix.model.DeviceModel;
import com.backend.irevix.repository.DeviceModelRepository;
import com.backend.irevix.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceModelRepository deviceModelRepository;

    @Autowired
    public DeviceService(DeviceRepository deviceRepository, DeviceModelRepository deviceModelRepository) {
        this.deviceRepository = deviceRepository;
        this.deviceModelRepository = deviceModelRepository;
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    public Optional<Device> getDeviceById(Long id) {
        return deviceRepository.findById(id);
    }

    public Optional<Device> getDeviceByName(String name) {
        return deviceRepository.findByName(name);
    }

    @Transactional
    public Device createOrUpdateDevice(Device device) {
        return deviceRepository.save(device);
    }

    @Transactional
    public List<Device> createOrUpdateDevices(List<Device> devices) {
        return deviceRepository.saveAll(devices);
    }

    public Map<String, Object> getDevicesWithModels() {
        try {
            System.out.println("Fetching devices and models for frontend");
            List<Device> devices = deviceRepository.findAll();

            // Provide fallback data if no devices are found
            if (devices.isEmpty()) {
                System.out.println("No devices found in database, using fallback data");
                return getFallbackDevicesAndModels();
            }

            Map<String, List<String>> deviceModels = new HashMap<>();
            List<Map<String, Object>> devicesList = new ArrayList<>();

            for (Device device : devices) {
                // Normalize device ID (lowercase, no spaces)
                String deviceId = device.getName().toLowerCase().replaceAll("\\s+", "");

                // Get all models for this device
                List<String> modelNames = deviceModelRepository.findByDeviceId(device.getId())
                        .stream()
                        .map(DeviceModel::getName)
                        .collect(Collectors.toList());

                // If no models found, provide fallback models
                if (modelNames.isEmpty()) {
                    System.out.println("No models found for device: " + device.getName() + ", using fallback models");
                    modelNames = getFallbackModelsForDevice(deviceId);
                }

                deviceModels.put(deviceId, modelNames);

                // Create device object for frontend
                Map<String, Object> deviceMap = new HashMap<>();
                deviceMap.put("id", deviceId);
                deviceMap.put("name", device.getName());
                deviceMap.put("icon", device.getIcon() != null ? device.getIcon() : getDefaultIcon(deviceId));
                devicesList.add(deviceMap);
            }

            System.out.println("Returning " + devicesList.size() + " devices with their models");
            System.out.println("Sample device data: " + devicesList.get(0));
            System.out.println("Sample model data: " + deviceModels.entrySet().iterator().next());

            Map<String, Object> response = new HashMap<>();
            response.put("devices", devicesList);
            response.put("deviceModels", deviceModels);

            return response;
        } catch (Exception e) {
            System.err.println("Error in getDevicesWithModels: " + e.getMessage());
            e.printStackTrace();
            return getFallbackDevicesAndModels();
        }
    }

    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }

    // Helper method for getting default icon based on device type
    private String getDefaultIcon(String deviceId) {
        deviceId = deviceId.toLowerCase();

        if (deviceId.contains("iphone")) {
            return "faMobileAlt";
        } else if (deviceId.contains("ipad")) {
            return "faTabletScreenButton";
        } else if (deviceId.contains("macbook") || deviceId.contains("mac")) {
            return "faLaptop";
        } else if (deviceId.contains("airpods")) {
            return "faHeadphones";
        } else if (deviceId.contains("watch")) {
            return "faClock";
        } else {
            return "faMobileAlt"; // Default icon
        }
    }

    // Fallback data methods
    private Map<String, Object> getFallbackDevicesAndModels() {
        Map<String, Object> response = new HashMap<>();

        List<Map<String, Object>> devices = new ArrayList<>();

        Map<String, Object> iphone = new HashMap<>();
        iphone.put("id", "iphone");
        iphone.put("name", "iPhone");
        iphone.put("icon", "faMobileAlt");
        devices.add(iphone);

        Map<String, Object> ipad = new HashMap<>();
        ipad.put("id", "ipad");
        ipad.put("name", "iPad");
        ipad.put("icon", "faTabletScreenButton");
        devices.add(ipad);

        Map<String, Object> macbook = new HashMap<>();
        macbook.put("id", "macbook");
        macbook.put("name", "MacBook");
        macbook.put("icon", "faLaptop");
        devices.add(macbook);

        Map<String, Object> airpods = new HashMap<>();
        airpods.put("id", "airpods");
        airpods.put("name", "AirPods");
        airpods.put("icon", "faHeadphones");
        devices.add(airpods);

        Map<String, Object> applewatch = new HashMap<>();
        applewatch.put("id", "applewatch");
        applewatch.put("name", "Apple Watch");
        applewatch.put("icon", "faClock");
        devices.add(applewatch);

        Map<String, List<String>> deviceModels = new HashMap<>();
        deviceModels.put("iphone", getFallbackModelsForDevice("iphone"));
        deviceModels.put("ipad", getFallbackModelsForDevice("ipad"));
        deviceModels.put("macbook", getFallbackModelsForDevice("macbook"));
        deviceModels.put("airpods", getFallbackModelsForDevice("airpods"));
        deviceModels.put("applewatch", getFallbackModelsForDevice("applewatch"));

        response.put("devices", devices);
        response.put("deviceModels", deviceModels);

        return response;
    }

    private List<String> getFallbackModelsForDevice(String deviceId) {
        List<String> models = new ArrayList<>();

        deviceId = deviceId.toLowerCase();

        if (deviceId.contains("iphone")) {
            models.add("iPhone 13 Pro");
            models.add("iPhone 13");
            models.add("iPhone 12 Pro");
            models.add("iPhone 12");
            models.add("iPhone 11 Pro");
            models.add("iPhone 11");
            models.add("iPhone XS");
            models.add("iPhone X");
        } else if (deviceId.contains("ipad")) {
            models.add("iPad Pro 12.9\"");
            models.add("iPad Pro 11\"");
            models.add("iPad Air");
            models.add("iPad Mini");
            models.add("iPad");
        } else if (deviceId.contains("macbook") || deviceId.contains("mac")) {
            models.add("MacBook Pro 16\"");
            models.add("MacBook Pro 14\"");
            models.add("MacBook Pro 13\"");
            models.add("MacBook Air");
        } else if (deviceId.contains("airpods")) {
            models.add("AirPods Pro");
            models.add("AirPods 3rd Gen");
            models.add("AirPods 2nd Gen");
            models.add("AirPods Max");
        } else if (deviceId.contains("watch") || deviceId.contains("applewatch")) {
            models.add("Apple Watch Series 7");
            models.add("Apple Watch Series 6");
            models.add("Apple Watch SE");
            models.add("Apple Watch Series 5");
        }

        return models;
    }
}