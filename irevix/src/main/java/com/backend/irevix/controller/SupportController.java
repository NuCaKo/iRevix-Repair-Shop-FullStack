package com.backend.irevix.controller;

import com.backend.irevix.model.Message;
import com.backend.irevix.model.Support;
import com.backend.irevix.service.SupportService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final SupportService supportService;

    @Autowired
    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @GetMapping
    public ResponseEntity<List<Support>> getAllSupportRequests() {
        List<Support> requests = supportService.getAllSupportRequests();
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Support> getSupportRequest(@PathVariable("id") int supportId) {
        Optional<Support> support = supportService.getSupportRequestById(supportId);
        return support.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Support>> getSupportRequestsByStatus(@PathVariable String status) {
        List<Support> requests = supportService.getSupportRequestsByStatus(status);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Support>> getUnreadSupportRequests() {
        List<Support> requests = supportService.getUnreadSupportRequests();
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    @GetMapping("/count/unread")
    public ResponseEntity<Map<String, Integer>> getUnreadCount() {
        int count = supportService.getUnreadCount();
        Map<String, Integer> response = new HashMap<>();
        response.put("count", count);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Support>> getUserSupportRequests(@PathVariable String userId) {
        List<Support> requests = supportService.getSupportRequestsByUserId(userId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Support> createSupportRequest(@RequestBody Support support) {
        Support createdSupport = supportService.createSupportRequest(support);
        return new ResponseEntity<>(createdSupport, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Support> updateSupportRequest(
            @PathVariable("id") int supportId,
            @RequestBody Support support) {
        Support updatedSupport = supportService.updateSupportRequest(supportId, support);
        if (updatedSupport != null) {
            return new ResponseEntity<>(updatedSupport, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<Support> addMessage(
            @PathVariable("id") int supportId,
            @RequestBody Message message) {
        Support updatedSupport = supportService.addMessage(supportId, message);
        if (updatedSupport != null) {
            return new ResponseEntity<>(updatedSupport, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Support> markAsRead(@PathVariable("id") int supportId) {
        Support updatedSupport = supportService.markAsRead(supportId);
        if (updatedSupport != null) {
            return new ResponseEntity<>(updatedSupport, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{id}/read-by-customer")
    public ResponseEntity<Support> markAsReadByCustomer(@PathVariable("id") int supportId) {
        Support updatedSupport = supportService.markAsReadByCustomer(supportId);
        if (updatedSupport != null) {
            return new ResponseEntity<>(updatedSupport, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        List<Support> updatedRequests = supportService.markAllAsRead();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", updatedRequests.size());
        response.put("message", updatedRequests.size() + " support requests marked as read");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Support> closeRequest(@PathVariable("id") int supportId) {
        Support updatedSupport = supportService.closeRequest(supportId);
        if (updatedSupport != null) {
            return new ResponseEntity<>(updatedSupport, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSupportRequest(@PathVariable("id") int supportId) {
        boolean deleted = supportService.deleteSupportRequest(supportId);

        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("success", true);
            response.put("message", "Support request deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("success", false);
            response.put("message", "Support request not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}