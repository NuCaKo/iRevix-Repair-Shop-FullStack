package com.backend.irevix.service;

import com.backend.irevix.model.Support;
import com.backend.irevix.repository.SupportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SupportService {

    private final SupportRepository supportRepository;

    @Autowired
    public SupportService(SupportRepository supportRepository) {
        this.supportRepository = supportRepository;
    }

    public List<Support> getAllSupportRequests() {
        return supportRepository.findAll();
    }

    public Optional<Support> getSupportRequestById(int supportId) {
        return supportRepository.findBySupportId(supportId);
    }

    public List<Support> getSupportRequestsByStatus(String status) {
        return supportRepository.findByStatus(status);
    }

    public List<Support> getUnreadSupportRequests() {
        return supportRepository.findByIsRead(false);
    }

    @Transactional
    public Support createSupportRequest(Support support) {
        // Generate the next supportId (simulating auto-increment)
        int maxSupportId = supportRepository.findAll().stream()
                .mapToInt(Support::getSupportId)
                .max()
                .orElse(0);

        support.setSupportId(maxSupportId + 1);

        // Set default values if not provided
        if (support.getStatus() == null) {
            support.setStatus("Open");
        }
        if (support.getPriority() == null) {
            support.setPriority("Normal");
        }
        if (support.getDate() == null) {
            support.setDate(java.time.LocalDate.now().toString());
        }

        // Ensure read status is set to false for new support requests
        support.setRead(false);

        return supportRepository.save(support);
    }

    @Transactional
    public Support updateSupportRequest(int supportId, Support supportRequest) {
        Optional<Support> optionalSupport = supportRepository.findBySupportId(supportId);
        if (optionalSupport.isPresent()) {
            Support support = optionalSupport.get();

            // Update only the fields that are provided
            if (supportRequest.getStatus() != null) {
                support.setStatus(supportRequest.getStatus());
            }
            if (supportRequest.getPriority() != null) {
                support.setPriority(supportRequest.getPriority());
            }

            // Handle read status
            if (supportRequest.isRead() != support.isRead()) {
                support.setRead(supportRequest.isRead());
            }

            if (supportRequest.getMessages() != null && !supportRequest.getMessages().isEmpty()) {
                support.setMessages(supportRequest.getMessages());
            }

            return supportRepository.save(support);
        }
        return null;
    }
}