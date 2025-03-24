package com.boot.demo.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ticketId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String issueType;
    private String issueDescription;
    private String status = "open"; // Default: Open
    private String priority = "medium"; // Default: Medium

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "resolved_by_admin", nullable = true)
    private User resolvedByAdmin;

	public int getTicketId() {
		return ticketId;
	}

	public void setTicketId(int ticketId) {
		this.ticketId = ticketId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getIssueType() {
		return issueType;
	}

	public void setIssueType(String issueType) {
		this.issueType = issueType;
	}

	public String getIssueDescription() {
		return issueDescription;
	}

	public void setIssueDescription(String issueDescription) {
		this.issueDescription = issueDescription;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getResolvedAt() {
		return resolvedAt;
	}

	public void setResolvedAt(LocalDateTime resolvedAt) {
		this.resolvedAt = resolvedAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public User getResolvedByAdmin() {
		return resolvedByAdmin;
	}

	public void setResolvedByAdmin(User resolvedByAdmin) {
		this.resolvedByAdmin = resolvedByAdmin;
	}

	public SupportTicket(int ticketId, User user, String issueType, String issueDescription, String status,
			String priority, LocalDateTime createdAt, LocalDateTime resolvedAt, LocalDateTime updatedAt) {
		super();
		this.ticketId = ticketId;
		this.user = user;
		this.issueType = issueType;
		this.issueDescription = issueDescription;
		this.status = status;
		this.priority = priority;
		this.createdAt = createdAt;
		this.resolvedAt = resolvedAt;
		this.updatedAt = updatedAt;
	}

	public SupportTicket() {
		super();
		// TODO Auto-generated constructor stub
	}
}
