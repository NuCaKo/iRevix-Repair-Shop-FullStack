package com.backend.irevix.service;

import com.backend.irevix.model.Device;
import com.backend.irevix.model.DeviceModel;
import com.backend.irevix.repository.DeviceModelRepository;
import com.backend.irevix.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeviceModelService {

    private final DeviceModelRepository deviceModelRepository;
    private final DeviceRepository deviceRepository;

    @Autowired
    public DeviceModelService(DeviceModelRepository deviceModelRepository, DeviceRepository deviceRepository) {
        this.deviceModelRepository = deviceModelRepository;
        this.deviceRepository = deviceRepository;
    }

    // Get all device models
    public List<DeviceModel> getAllDeviceModels() {
        return deviceModelRepository.findAll();
    }

    // Get device models by device ID
    public List<DeviceModel> getDeviceModelsByDeviceId(Long deviceId) {
        return deviceModelRepository.findByDeviceId(deviceId);
    }

    // Get a specific device model by ID
    public Optional<DeviceModel> getDeviceModelById(Long id) {
        return deviceModelRepository.findById(id);
    }

    // Create a new device model
    public DeviceModel createDeviceModel(DeviceModel deviceModel) {
        // Ensure device exists
        if (deviceModel.getDeviceId() == null) {
            throw new IllegalArgumentException("Device ID must be provided");
        }

        // Get the device entity
        Optional<Device> deviceOpt = deviceRepository.findById(deviceModel.getDeviceId());
        if (!deviceOpt.isPresent()) {
            throw new IllegalArgumentException("Device with ID " + deviceModel.getDeviceId() + " not found");
        }

        deviceModel.setDevice(deviceOpt.get());

        // Optional: Set default release order if not provided
        if (deviceModel.getReleaseOrder() == 0) {
            // Find the max release order for the device and increment
            int maxReleaseOrder = deviceModelRepository.findByDeviceId(deviceModel.getDeviceId())
                    .stream()
                    .mapToInt(DeviceModel::getReleaseOrder)
                    .max()
                    .orElse(0);
            deviceModel.setReleaseOrder(maxReleaseOrder + 1);
        }

        return deviceModelRepository.save(deviceModel);
    }

    // Update an existing device model
    public DeviceModel updateDeviceModel(Long id, DeviceModel deviceModelDetails) {
        Optional<DeviceModel> optionalDeviceModel = deviceModelRepository.findById(id);

        if (optionalDeviceModel.isPresent()) {
            DeviceModel deviceModel = optionalDeviceModel.get();

            // Update fields that might have changed
            if (deviceModelDetails.getName() != null) {
                deviceModel.setName(deviceModelDetails.getName());
            }

            if (deviceModelDetails.getDeviceId() != null) {
                Optional<Device> deviceOpt = deviceRepository.findById(deviceModelDetails.getDeviceId());
                if (deviceOpt.isPresent()) {
                    deviceModel.setDevice(deviceOpt.get());
                }
            }

            // Explicitly handle isPremium to use the provided value or keep existing
            deviceModel.setPremium(deviceModelDetails.isPremium());

            // Update release order if provided
            if (deviceModelDetails.getReleaseOrder() > 0) {
                deviceModel.setReleaseOrder(deviceModelDetails.getReleaseOrder());
            }

            return deviceModelRepository.save(deviceModel);
        }

        return null;
    }

    // Delete a device model
    public void deleteDeviceModel(Long id) {
        deviceModelRepository.deleteById(id);
    }
}