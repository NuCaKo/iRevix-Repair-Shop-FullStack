package com.backend.irevix.controller;

import com.backend.irevix.model.Notification;
import com.backend.irevix.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification createdNotification = notificationService.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable Long id) {
        try {
            Notification updatedNotification = notificationService.markNotificationAsRead(id);

            if (updatedNotification != null) {
                System.out.println("Notification marked as read: " + updatedNotification.getId());
                return ResponseEntity.ok(updatedNotification);
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @PutMapping("/read-all")
    public ResponseEntity<List<Notification>> markAllNotificationsAsRead() {
        try {
            List<Notification> updatedNotifications = notificationService.markAllNotificationsAsRead();
            return ResponseEntity.ok(updatedNotifications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        List<Notification> unreadNotifications = notificationService.getUnreadNotifications();
        return ResponseEntity.ok(unreadNotifications);
    }
}