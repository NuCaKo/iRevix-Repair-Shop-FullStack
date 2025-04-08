package com.backend.irevix.repository;

import com.backend.irevix.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIsRead(Boolean isRead);
    List<Notification> findByType(String type);
    List<Notification> findAllByOrderByDateDesc();
}