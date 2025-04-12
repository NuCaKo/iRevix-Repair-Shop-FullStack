package com.backend.irevix.controller;

import com.backend.irevix.model.Support;
import com.backend.irevix.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<List<Support>> getAllSupportRequests(
            @RequestParam(required = false) String status
    ) {
        List<Support> supportRequests;
        if (status != null) {
            supportRequests = supportService.getSupportRequestsByStatus(status);
        } else {
            supportRequests = supportService.getAllSupportRequests();
        }
        return ResponseEntity.ok(supportRequests);
    }
    @GetMapping("/unread")
    public ResponseEntity<List<Support>> getUnreadSupportRequests() {
        List<Support> unreadRequests = supportService.getUnreadSupportRequests();
        return ResponseEntity.ok(unreadRequests);
    }
    @GetMapping("/{supportId}")
    public ResponseEntity<Support> getSupportRequestById(@PathVariable int supportId) {
        Optional<Support> supportRequest = supportService.getSupportRequestById(supportId);
        return supportRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<Support> createSupportRequest(@RequestBody Support support) {
        Support createdSupportRequest = supportService.createSupportRequest(support);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSupportRequest);
    }
    @PutMapping("/{supportId}")
    public ResponseEntity<Support> updateSupportRequest(
            @PathVariable int supportId,
            @RequestBody Support supportRequest) {
        Support updatedSupportRequest = supportService.updateSupportRequest(supportId, supportRequest);
        if (updatedSupportRequest != null) {
            return ResponseEntity.ok(updatedSupportRequest);
        }
        return ResponseEntity.notFound().build();
    }
}