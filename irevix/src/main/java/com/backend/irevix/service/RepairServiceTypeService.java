package com.backend.irevix.service;

import com.backend.irevix.model.RepairServiceType;
import com.backend.irevix.repository.RepairServiceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RepairServiceTypeService {

    private final RepairServiceTypeRepository repairServiceTypeRepository;

    @Autowired
    public RepairServiceTypeService(RepairServiceTypeRepository repairServiceTypeRepository) {
        this.repairServiceTypeRepository = repairServiceTypeRepository;
    }

    public List<RepairServiceType> getAllServiceTypes() {
        return repairServiceTypeRepository.findAll();
    }

    public List<RepairServiceType> getActiveServiceTypes() {
        return repairServiceTypeRepository.findByIsActiveTrue();
    }

    public List<RepairServiceType> getServiceTypesByDevice(String deviceType) {
        return repairServiceTypeRepository.findByDeviceType(deviceType);
    }

    public List<RepairServiceType> getActiveServiceTypesByDevice(String deviceType) {
        return repairServiceTypeRepository.findByDeviceTypeAndIsActiveTrue(deviceType);
    }

    public Optional<RepairServiceType> getServiceTypeById(Long id) {
        return repairServiceTypeRepository.findById(id);
    }

    @Transactional
    public RepairServiceType createServiceType(RepairServiceType serviceType) {
        return repairServiceTypeRepository.save(serviceType);
    }

    @Transactional
    public RepairServiceType updateServiceType(Long id, RepairServiceType serviceTypeDetails) {
        Optional<RepairServiceType> optionalServiceType = repairServiceTypeRepository.findById(id);
        if (optionalServiceType.isPresent()) {
            RepairServiceType serviceType = optionalServiceType.get();

            if (serviceTypeDetails.getTitle() != null) {
                serviceType.setTitle(serviceTypeDetails.getTitle());
            }
            if (serviceTypeDetails.getDeviceType() != null) {
                serviceType.setDeviceType(serviceTypeDetails.getDeviceType());
            }
            if (serviceTypeDetails.getBasePrice() != null) {
                serviceType.setBasePrice(serviceTypeDetails.getBasePrice());
            }
            if (serviceTypeDetails.getDescription() != null) {
                serviceType.setDescription(serviceTypeDetails.getDescription());
            }
            if (serviceTypeDetails.getImageUrl() != null) {
                serviceType.setImageUrl(serviceTypeDetails.getImageUrl());
            }
            if (serviceTypeDetails.getIsActive() != null) {
                serviceType.setIsActive(serviceTypeDetails.getIsActive());
            }

            return repairServiceTypeRepository.save(serviceType);
        }
        return null;
    }

    public void deleteServiceType(Long id) {
        repairServiceTypeRepository.deleteById(id);
    }
}