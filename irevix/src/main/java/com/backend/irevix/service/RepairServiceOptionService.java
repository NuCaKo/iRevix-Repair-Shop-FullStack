package com.backend.irevix.service;

import com.backend.irevix.model.RepairServiceOption;
import com.backend.irevix.repository.RepairServiceOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RepairServiceOptionService {

    private final RepairServiceOptionRepository repairServiceOptionRepository;

    @Autowired
    public RepairServiceOptionService(RepairServiceOptionRepository repairServiceOptionRepository) {
        this.repairServiceOptionRepository = repairServiceOptionRepository;
    }

    public List<RepairServiceOption> getAllServiceOptions() {
        return repairServiceOptionRepository.findAll();
    }

    public List<RepairServiceOption> getServiceOptionsByType(Long serviceTypeId) {
        return repairServiceOptionRepository.findByServiceTypeId(serviceTypeId);
    }

    public List<RepairServiceOption> getActiveServiceOptionsByType(Long serviceTypeId) {
        return repairServiceOptionRepository.findByServiceTypeIdAndIsActiveTrue(serviceTypeId);
    }

    public Optional<RepairServiceOption> getServiceOptionById(Long id) {
        return repairServiceOptionRepository.findById(id);
    }

    @Transactional
    public RepairServiceOption createServiceOption(RepairServiceOption serviceOption) {
        return repairServiceOptionRepository.save(serviceOption);
    }

    @Transactional
    public RepairServiceOption updateServiceOption(Long id, RepairServiceOption serviceOptionDetails) {
        Optional<RepairServiceOption> optionalServiceOption = repairServiceOptionRepository.findById(id);
        if (optionalServiceOption.isPresent()) {
            RepairServiceOption serviceOption = optionalServiceOption.get();

            if (serviceOptionDetails.getName() != null) {
                serviceOption.setName(serviceOptionDetails.getName());
            }
            if (serviceOptionDetails.getPrice() != null) {
                serviceOption.setPrice(serviceOptionDetails.getPrice());
            }
            if (serviceOptionDetails.getDescription() != null) {
                serviceOption.setDescription(serviceOptionDetails.getDescription());
            }
            if (serviceOptionDetails.getIsActive() != null) {
                serviceOption.setIsActive(serviceOptionDetails.getIsActive());
            }
            if (serviceOptionDetails.getServiceType() != null) {
                serviceOption.setServiceType(serviceOptionDetails.getServiceType());
            }

            return repairServiceOptionRepository.save(serviceOption);
        }
        return null;
    }

    public void deleteServiceOption(Long id) {
        repairServiceOptionRepository.deleteById(id);
    }
}