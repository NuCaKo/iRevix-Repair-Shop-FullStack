package com.backend.irevix.service;

import com.backend.irevix.model.Notification;
import com.backend.irevix.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByDateDesc();
    }

    public List<Notification> getNotificationsByType(String type) {
        return notificationRepository.findByType(type);
    }

    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByIsRead(false);
    }

    @Transactional
    public Notification createNotification(Notification notification) {
        notification.setDate(new Date());
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification markNotificationAsRead(Long id) {
        Optional<Notification> optionalNotification = notificationRepository.findById(id);

        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setIsRead(true);
            notification.setReadAt(new Date());
            Notification savedNotification = notificationRepository.saveAndFlush(notification);

            return savedNotification;
        }

        return null;
    }

    @Transactional
    public List<Notification> markAllNotificationsAsRead() {
        List<Notification> unreadNotifications = notificationRepository.findByIsRead(false);

        Date now = new Date();
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(now);
        }
        return notificationRepository.saveAll(unreadNotifications);
    }
}