package com.boot.demo.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_admins")
public class TicketAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public SupportTicket getTicket() {
		return ticket;
	}

	public void setTicket(SupportTicket ticket) {
		this.ticket = ticket;
	}

	public User getAdmin() {
		return admin;
	}

	public void setAdmin(User admin) {
		this.admin = admin;
	}

	public LocalDateTime getAssignedAt() {
		return assignedAt;
	}

	public void setAssignedAt(LocalDateTime assignedAt) {
		this.assignedAt = assignedAt;
	}

	public TicketAdmin(int id, SupportTicket ticket, User admin, LocalDateTime assignedAt) {
		super();
		this.id = id;
		this.ticket = ticket;
		this.admin = admin;
		this.assignedAt = assignedAt;
	}

	public TicketAdmin() {
		super();
		// TODO Auto-generated constructor stub
	}
    
}
