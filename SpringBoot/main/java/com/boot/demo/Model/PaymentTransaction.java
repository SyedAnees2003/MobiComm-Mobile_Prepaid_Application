package com.boot.demo.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JsonBackReference("recharge-payment")
    @JoinColumn(name = "recharge_id", nullable = false)
    private RechargeHistory recharge;

    private BigDecimal amount;
    private String paymentMethod;
    private String transactionType;
    private String status;

    @Column(name = "transaction_date", updatable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();
    
    private String transactionReferenceId;  // ✅ Razorpay Payment ID

    // Constructors
    public PaymentTransaction() {}

    public PaymentTransaction(User user, RechargeHistory recharge, BigDecimal amount, String paymentMethod, String transactionType, String status) {
        this.user = user;
        this.recharge = recharge;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionType = transactionType;
        this.status = status;
    }

    public PaymentTransaction(Long transactionId, User user, RechargeHistory recharge, BigDecimal amount,
			String paymentMethod, String transactionType, String status, LocalDateTime transactionDate,
			String transactionReferenceId) {
		this.transactionId = transactionId;
		this.user = user;
		this.recharge = recharge;
		this.amount = amount;
		this.paymentMethod = paymentMethod;
		this.transactionType = transactionType;
		this.status = status;
		this.transactionDate = transactionDate;
		this.transactionReferenceId = transactionReferenceId;
	}

	// Getters and Setters
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public RechargeHistory getRecharge() { return recharge; }
    public void setRecharge(RechargeHistory recharge) { this.recharge = recharge; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

	public String getTransactionReferenceId() {
		return transactionReferenceId;
	}

	public void setTransactionReferenceId(String transactionReferenceId) {
		this.transactionReferenceId = transactionReferenceId;
	}

}
