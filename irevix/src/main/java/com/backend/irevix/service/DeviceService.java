package com.backend.irevix.service;

import com.backend.irevix.model.Device;
import com.backend.irevix.model.DeviceModel;
import com.backend.irevix.repository.DeviceModelRepository;
import com.backend.irevix.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        List<Device> devices = deviceRepository.findAll();

        Map<String, List<String>> deviceModels = new HashMap<>();
        List<Map<String, Object>> devicesList = devices.stream()
                .map(device -> {
                    String deviceId = device.getName().toLowerCase().replaceAll("\\s+", "");

                    // Get device models from the separate entity
                    List<String> modelNames = deviceModelRepository.findByDeviceId(device.getId())
                            .stream()
                            .map(DeviceModel::getName)
                            .collect(Collectors.toList());

                    deviceModels.put(deviceId, modelNames);

                    Map<String, Object> deviceMap = new HashMap<>();
                    deviceMap.put("id", deviceId);
                    deviceMap.put("name", device.getName());
                    deviceMap.put("icon", device.getIcon());
                    return deviceMap;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("devices", devicesList);
        response.put("deviceModels", deviceModels);

        return response;
    }

    public void deleteDevice(Long id) {
        deviceRepository.deleteById(id);
    }
}