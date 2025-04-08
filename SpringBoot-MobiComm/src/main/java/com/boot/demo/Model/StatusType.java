package com.boot.demo.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "status_types")
public class StatusType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int statusId;

    @Column(nullable = false)
    private String entityType;

    @Column(nullable = false)
    private String statusName;

    // ✅ Default Constructor
    public StatusType() {}

    // ✅ Parameterized Constructor
    public StatusType(String entityType, String statusName) {
        this.entityType = entityType;
        this.statusName = statusName;
    }

    // ✅ Getters & Setters
    public int getStatusId() { return statusId; }
    public void setStatusId(int statusId) { this.statusId = statusId; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }
}

