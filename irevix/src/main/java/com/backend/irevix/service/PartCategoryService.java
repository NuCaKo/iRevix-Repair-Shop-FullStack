package com.backend.irevix.service;

import com.backend.irevix.model.Device;
import com.backend.irevix.model.PartCategory;
import com.backend.irevix.repository.DeviceRepository;
import com.backend.irevix.repository.PartCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PartCategoryService {

    private final PartCategoryRepository partCategoryRepository;
    private final DeviceRepository deviceRepository;

    @Autowired
    public PartCategoryService(PartCategoryRepository partCategoryRepository, DeviceRepository deviceRepository) {
        this.partCategoryRepository = partCategoryRepository;
        this.deviceRepository = deviceRepository;
    }

    public List<PartCategory> getAllPartCategories() {
        return partCategoryRepository.findAll();
    }

    public List<PartCategory> getPartCategoriesByDeviceId(Long deviceId) {
        return partCategoryRepository.findByDeviceId(deviceId);
    }

    public Optional<PartCategory> getPartCategoryById(Long id) {
        return partCategoryRepository.findById(id);
    }

    @Transactional
    public PartCategory createPartCategory(PartCategory partCategory) {
        if (partCategory.getDeviceId() != null) {
            Optional<Device> deviceOpt = deviceRepository.findById(partCategory.getDeviceId());
            if (deviceOpt.isPresent()) {
                partCategory.setDevice(deviceOpt.get());
            }
        }
        return partCategoryRepository.save(partCategory);
    }

    @Transactional
    public PartCategory updatePartCategory(Long id, PartCategory partCategoryDetails) {
        Optional<PartCategory> optionalPartCategory = partCategoryRepository.findById(id);
        if (optionalPartCategory.isPresent()) {
            PartCategory partCategory = optionalPartCategory.get();
            if (partCategoryDetails.getDeviceId() != null) {
                Optional<Device> deviceOpt = deviceRepository.findById(partCategoryDetails.getDeviceId());
                if (deviceOpt.isPresent()) {
                    partCategory.setDevice(deviceOpt.get());
                }
            }

            if (partCategoryDetails.getCategory() != null) {
                partCategory.setCategory(partCategoryDetails.getCategory());
            }
            if (partCategoryDetails.getPrefix() != null) {
                partCategory.setPrefix(partCategoryDetails.getPrefix());
            }
            if (partCategoryDetails.getIcon() != null) {
                partCategory.setIcon(partCategoryDetails.getIcon());
            }
            if (partCategoryDetails.getBasePrice() > 0) {
                partCategory.setBasePrice(partCategoryDetails.getBasePrice());
            }

            return partCategoryRepository.save(partCategory);
        }
        return null;
    }

    public void deletePartCategory(Long id) {
        partCategoryRepository.deleteById(id);
    }
}