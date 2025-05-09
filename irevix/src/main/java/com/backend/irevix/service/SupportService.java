package com.backend.irevix.service;

import com.backend.irevix.model.Message;
import com.backend.irevix.model.Support;
import com.backend.irevix.repository.SupportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    public int getUnreadCount() {
        return supportRepository.countByIsRead(false);
    }

    public List<Support> getSupportRequestsByCustomer(String customer) {
        return supportRepository.findByCustomer(customer);
    }

    public List<Support> getSupportRequestsByUserId(String userId) {
        return supportRepository.findByUserId(userId);
    }

    public List<Support> getSupportRequestsByCategory(String category) {
        return supportRepository.findByCategory(category);
    }

    @Transactional
    public Support createSupportRequest(Support support) {
        int maxSupportId = supportRepository.findAll().stream()
                .mapToInt(Support::getSupportId)
                .max()
                .orElse(0);

        support.setSupportId(maxSupportId + 1);
        if (support.getStatus() == null) {
            support.setStatus("Open");
        }
        if (support.getPriority() == null) {
            support.setPriority("Normal");
        }
        if (support.getDate() == null) {
            support.setDate(LocalDate.now().toString());
        }
        support.setRead(false);

        // Add initial system message
        Message systemMessage = new Message();
        systemMessage.setSender("system");
        systemMessage.setMessage("Your request has been received. A support agent will contact you shortly.");
        systemMessage.setDate(LocalDateTime.now().toString());

        if (support.getMessages() == null || support.getMessages().isEmpty()) {
            support.addMessage(systemMessage);
        }

        return supportRepository.save(support);
    }

    @Transactional
    public Support updateSupportRequest(int supportId, Support supportRequest) {
        Optional<Support> optionalSupport = supportRepository.findBySupportId(supportId);
        if (optionalSupport.isPresent()) {
            Support support = optionalSupport.get();

            if (supportRequest.getTitle() != null) {
                support.setTitle(supportRequest.getTitle());
            }
            if (supportRequest.getDescription() != null) {
                support.setDescription(supportRequest.getDescription());
            }
            if (supportRequest.getStatus() != null) {
                support.setStatus(supportRequest.getStatus());
            }
            if (supportRequest.getPriority() != null) {
                support.setPriority(supportRequest.getPriority());
            }

            // Only update read status if it changed
            if (supportRequest.isRead() != support.isRead()) {
                support.setRead(supportRequest.isRead());
            }

            // Only update messages if new ones were provided
            if (supportRequest.getMessages() != null && !supportRequest.getMessages().isEmpty()) {
                support.setMessages(supportRequest.getMessages());
            }

            return supportRepository.save(support);
        }
        return null;
    }

    @Transactional
    public Support addMessage(int supportId, Message message) {
        Optional<Support> optionalSupport = supportRepository.findBySupportId(supportId);
        if (optionalSupport.isPresent()) {
            Support support = optionalSupport.get();

            // Set message date if not provided
            if (message.getDate() == null) {
                message.setDate(LocalDateTime.now().toString());
            }

            // Update read status based on message sender
            if ("agent".equals(message.getSender())) {
                support.setReadByCustomer(false);
                support.setStatus("In Progress");
            } else if ("customer".equals(message.getSender())) {
                support.setRead(false);
            }

            support.addMessage(message);
            return supportRepository.save(support);
        }
        return null;
    }

    @Transactional
    public Support markAsRead(int supportId) {
        Optional<Support> optionalSupport = supportRepository.findBySupportId(supportId);
        if (optionalSupport.isPresent()) {
            Support support = optionalSupport.get();
            support.setRead(true);
            return supportRepository.save(support);
        }
        return null;
    }

    @Transactional
    public Support markAsReadByCustomer(int supportId) {
        Optional<Support> optionalSupport = supportRepository.findBySupportId(supportId);
        if (optionalSupport.isPresent()) {
            Support support = optionalSupport.get();
            support.setReadByCustomer(true);
            return supportRepository.save(support);
        }
        return null;
    }

    @Transactional
    public List<Support> markAllAsRead() {
        List<Support> unreadRequests = supportRepository.findByIsRead(false);

        if (!unreadRequests.isEmpty()) {
            for (Support support : unreadRequests) {
                support.setRead(true);
                supportRepository.save(support);
            }
        }

        return unreadRequests;
    }

    @Transactional
    public Support closeRequest(int supportId) {
        Optional<Support> optionalSupport = supportRepository.findBySupportId(supportId);
        if (optionalSupport.isPresent()) {
            Support support = optionalSupport.get();
            support.setStatus("Closed");

            // Add system message about closing
            Message systemMessage = new Message();
            systemMessage.setSender("system");
            systemMessage.setMessage("This support request has been marked as resolved and closed.");
            systemMessage.setDate(LocalDateTime.now().toString());

            support.addMessage(systemMessage);
            return supportRepository.save(support);
        }
        return null;
    }

    @Transactional
    public boolean deleteSupportRequest(int supportId) {
        Optional<Support> optionalSupport = supportRepository.findBySupportId(supportId);
        if (optionalSupport.isPresent()) {
            supportRepository.delete(optionalSupport.get());
            return true;
        }
        return false;
    }
}