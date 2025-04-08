package com.boot.demo.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notifications {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private int notificationId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "notify_type", length = 50)
    private String notifyType;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "status", length = 50, nullable = false)
    private String status = "active";

    @Column(name = "preference_status", length = 50, nullable = false)
    private String preferenceStatus = "enabled";

    @Column(name = "read_status", length = 50, nullable = false)
    private String readStatus = "unread";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public Notifications() {}

    public Notifications(User user, String notifyType, String message) {
        this.user = user;
        this.notifyType = notifyType;
        this.message = message;
        this.status = "active";
        this.preferenceStatus = "enabled";
        this.readStatus = "unread";
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public int getNotificationId() { return notificationId; }
    public void setNotificationId(int notificationId) { this.notificationId = notificationId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getNotifyType() { return notifyType; }
    public void setNotifyType(String notifyType) { this.notifyType = notifyType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPreferenceStatus() { return preferenceStatus; }
    public void setPreferenceStatus(String preferenceStatus) { this.preferenceStatus = preferenceStatus; }

    public String getReadStatus() { return readStatus; }
    public void setReadStatus(String readStatus) { this.readStatus = readStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
