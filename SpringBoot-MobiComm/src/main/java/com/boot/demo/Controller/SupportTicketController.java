package com.boot.demo.Controller;

import com.boot.demo.Exception.TicketNotFoundException;
import com.boot.demo.Exception.UserNotFoundException;
import com.boot.demo.Model.SupportTicket;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.SupportTicketRepository;
import com.boot.demo.Repository.UserRepository;
import com.boot.demo.Service.SupportTicketService;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/support-tickets")
@CrossOrigin(origins = "*")
public class SupportTicketController {

    @Autowired
    private SupportTicketService supportTicketService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SupportTicketRepository supportTicketRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllSupportTickets() {
        try {
            List<SupportTicket> tickets = supportTicketService.getAllTickets();
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching support tickets.");
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<SupportTicket>> getRecentSupportTickets() {
        List<SupportTicket> recentTickets = supportTicketService.getRecentSupportTickets();
        return ResponseEntity.ok(recentTickets);
    }
    
    @GetMapping("/recent/{mobileNumber}")
    public ResponseEntity<?> getRecentRequest(@PathVariable String mobileNumber) {
        // ✅ Find user by mobile number
    	 User user = userRepository.findByMobileNumber(mobileNumber)
                 .orElseThrow(() -> new UserNotFoundException("User with mobile " + mobileNumber + " not found"));

		return ResponseEntity.ok(
		Optional.ofNullable(supportTicketRepository.findTopByUserOrderByCreatedAtDesc(user))
		       .orElseThrow(() -> new TicketNotFoundException("No support tickets found for user"))
		);
    }
    
    @GetMapping("/user/{mobileNumber}")
    public ResponseEntity<?> getAllUserTickets(@PathVariable String mobileNumber) {
        try {
            List<SupportTicket> tickets = supportTicketService.getAllTicketsByMobileNumber(mobileNumber);
            return ResponseEntity.ok(tickets);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> requestData) {
        String mobileNumber = requestData.get("mobileNumber");
        String issueType = requestData.get("issueType");
        String issueDescription = requestData.get("issueDescription");

        if (mobileNumber == null || issueType == null || issueDescription == null) {
            return ResponseEntity.badRequest().body("❌ Invalid data format.");
        }

        // 🔍 Find user by mobile number
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new UserNotFoundException("❌ User not found."));

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user); // ✅ Use found userId
        ticket.setIssueType(issueType);
        ticket.setIssueDescription(issueDescription);
        ticket.setCreatedAt(LocalDateTime.now());

        supportTicketRepository.save(ticket);
        return ResponseEntity.ok("✅ Support ticket submitted successfully.");
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable int ticketId, @RequestBody Map<String, String> updates) {
        String newStatus = updates.get("status");
        String newPriority = updates.get("priority");

        try {
            SupportTicket updatedTicket = supportTicketService.updateTicket(ticketId, newStatus, newPriority);
            return ResponseEntity.ok(updatedTicket);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    @PutMapping("/resolve/{ticketId}")
    public ResponseEntity<SupportTicket> resolveTicket(
            @PathVariable int ticketId,
            @RequestBody Map<String, Object> requestBody) {

    	SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("❌ Ticket not found."));
    	
        ticket.setStatus("resolved");
        ticket.setPriority("low");  // Ensure priority is updated to "low"
        ticket.setResolvedAt(LocalDateTime.now());

        // Fetch admin ID from request body
        int adminId = Integer.valueOf(requestBody.get("resolvedByAdmin").toString());

        // Find admin user in the database
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UserNotFoundException("❌ Admin not found."));
        ticket.setResolvedByAdmin(admin);

        supportTicketRepository.save(ticket);
        return ResponseEntity.ok(ticket);
    }

}
