package com.boot.demo.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "recharge_history")
public class RechargeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int rechargeId;
    
    @ManyToOne
    @JsonBackReference("plan-rechargeHistory")
    @JoinColumn(name = "plan_id", nullable = false)
    private RechargePlan plan; // ✅ Ensure this matches the mappedBy in `RechargePlan`


    @ManyToOne
    @JsonBackReference("user-recharge")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

	private BigDecimal amount;
    private String status = "successful"; // Default value
    private String rechargeMode;
    
    @Column(name = "recharge_date", updatable = false)
    private LocalDateTime rechargeDate = LocalDateTime.now(); // Auto timestamp

    // Constructors
    public RechargeHistory() {}

    public RechargeHistory(User user, RechargePlan plan, BigDecimal amount, String status, String rechargeMode) {
        this.user = user;
        this.plan = plan;
        this.amount = amount;
        this.status = status;
        this.rechargeMode = rechargeMode;
    }

    // Getters and Setters
    public int getRechargeId() { return rechargeId; }
    public void setRechargeId(int rechargeId) { this.rechargeId = rechargeId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public RechargePlan getPlan() { return plan; }
    public void setPlan(RechargePlan plan) { this.plan = plan; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRechargeMode() { return rechargeMode; }
    public void setRechargeMode(String rechargeMode) { this.rechargeMode = rechargeMode; }

    public LocalDateTime getRechargeDate() { return rechargeDate; }
}
