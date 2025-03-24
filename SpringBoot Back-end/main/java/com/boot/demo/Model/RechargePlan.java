package com.boot.demo.Model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "recharge_plans")
@JsonIgnoreProperties(ignoreUnknown = true)
public class RechargePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int planId;

    @Column(nullable = false)
    private String planName;
    
    private int validityDays;
    private double price;
    private String sms;
    private String calls;
    private String data;

    @Column(columnDefinition = "JSON")
    private String additionalBenefits;

    private String status;

    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private String createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private String updatedAt;

    // ✅ Correct Foreign Key Relationship
    @JsonBackReference("category-rechargePlans")
    @ManyToOne
    @JoinColumn(name = "category_id", referencedColumnName = "category_id", nullable = true)
    private Category category;
    
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonBackReference("plan-rechargeHistory")
    private List<RechargeHistory> rechargeHistoryList;
    
    // ✅ Add categoryId explicitly in JSON response
    @JsonProperty("categoryId")
    public int getCategoryId() {
        return category != null ? category.getCategoryId() : 0;
    }

    // Getters and Setters
    public int getPlanId() { return planId; }
    public void setPlanId(int planId) { this.planId = planId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public int getValidityDays() { return validityDays; }
    public void setValidityDays(int validityDays) { this.validityDays = validityDays; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getSms() { return sms; }
    public void setSms(String sms) { this.sms = sms; }

    public String getCalls() { return calls; }
    public void setCalls(String calls) { this.calls = calls; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }

    public String getAdditionalBenefits() { return additionalBenefits; }
    public void setAdditionalBenefits(String additionalBenefits) { this.additionalBenefits = additionalBenefits; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public List<RechargeHistory> getRechargeHistoryList() { return rechargeHistoryList; }
    public void setRechargeHistoryList(List<RechargeHistory> rechargeHistoryList) { this.rechargeHistoryList = rechargeHistoryList; }
}

