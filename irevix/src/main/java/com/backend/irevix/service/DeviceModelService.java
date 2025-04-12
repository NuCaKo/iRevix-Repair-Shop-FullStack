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
    public List<DeviceModel> getAllDeviceModels() {
        return deviceModelRepository.findAll();
    }
    public List<DeviceModel> getDeviceModelsByDeviceId(Long deviceId) {
        return deviceModelRepository.findByDeviceId(deviceId);
    }
    public Optional<DeviceModel> getDeviceModelById(Long id) {
        return deviceModelRepository.findById(id);
    }
    public DeviceModel createDeviceModel(DeviceModel deviceModel) {
        if (deviceModel.getDeviceId() == null) {
            throw new IllegalArgumentException("Device ID must be provided");
        }
        Optional<Device> deviceOpt = deviceRepository.findById(deviceModel.getDeviceId());
        if (!deviceOpt.isPresent()) {
            throw new IllegalArgumentException("Device with ID " + deviceModel.getDeviceId() + " not found");
        }

        deviceModel.setDevice(deviceOpt.get());
        if (deviceModel.getReleaseOrder() == 0) {
            int maxReleaseOrder = deviceModelRepository.findByDeviceId(deviceModel.getDeviceId())
                    .stream()
                    .mapToInt(DeviceModel::getReleaseOrder)
                    .max()
                    .orElse(0);
            deviceModel.setReleaseOrder(maxReleaseOrder + 1);
        }

        return deviceModelRepository.save(deviceModel);
    }
    public DeviceModel updateDeviceModel(Long id, DeviceModel deviceModelDetails) {
        Optional<DeviceModel> optionalDeviceModel = deviceModelRepository.findById(id);

        if (optionalDeviceModel.isPresent()) {
            DeviceModel deviceModel = optionalDeviceModel.get();
            if (deviceModelDetails.getName() != null) {
                deviceModel.setName(deviceModelDetails.getName());
            }

            if (deviceModelDetails.getDeviceId() != null) {
                Optional<Device> deviceOpt = deviceRepository.findById(deviceModelDetails.getDeviceId());
                if (deviceOpt.isPresent()) {
                    deviceModel.setDevice(deviceOpt.get());
                }
            }
            deviceModel.setPremium(deviceModelDetails.isPremium());
            if (deviceModelDetails.getReleaseOrder() > 0) {
                deviceModel.setReleaseOrder(deviceModelDetails.getReleaseOrder());
            }

            return deviceModelRepository.save(deviceModel);
        }

        return null;
    }
    public void deleteDeviceModel(Long id) {
        deviceModelRepository.deleteById(id);
    }
}