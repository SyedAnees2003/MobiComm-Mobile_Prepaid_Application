package com.boot.demo.Model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    @Column(unique = true, nullable = true)
    private String mobileNumber;  // Nullable for Admin

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = true)
    private String email;  // Nullable for User

    private String passwordHash; // Only for Admin

    private String dateOfBirth;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    private String rewardsTier;  // Only for User

    @ManyToOne
    @JoinColumn(name = "status_id")
    private StatusType status;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("user-recharge")
    private List<RechargeHistory> rechargeHistoryList;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // ✅ Prevents serialization issues
    private List<Address> addresses;


    private String preferenceStatus;
    @Column(name = "last_login")
    private LocalDateTime lastLogin; // ✅ Store as LocalDateTime    
    private String createdAt;
    private String updatedAt;

    // ✅ Default Constructor
    public User() {}

    // ✅ Constructor for User (Mobile Login)
    public User(String mobileNumber, String firstName, String lastName, String dateOfBirth, Role role, String rewardsTier, StatusType status, String preferenceStatus) {
        this.mobileNumber = mobileNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.role = role;
        this.rewardsTier = rewardsTier;
        this.status = status;
        this.preferenceStatus = preferenceStatus;
    }

    // ✅ Constructor for Admin (Email Login)
    public User(String email, String firstName, String lastName, String passwordHash, Role role) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    // ✅ Getters & Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getRewardsTier() { return rewardsTier; }
    public void setRewardsTier(String rewardsTier) { this.rewardsTier = rewardsTier; }

    public StatusType getStatus() { return status; }
    public void setStatus(StatusType status) { this.status = status; }

    public String getPreferenceStatus() { return preferenceStatus; }
    public void setPreferenceStatus(String preferenceStatus) { this.preferenceStatus = preferenceStatus; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    
    public List<RechargeHistory> getRechargeHistoryList() { return rechargeHistoryList; }
    public void setRechargeHistoryList(List<RechargeHistory> rechargeHistoryList) { this.rechargeHistoryList = rechargeHistoryList; }
}
