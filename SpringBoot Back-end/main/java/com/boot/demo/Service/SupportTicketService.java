package com.boot.demo.Service;

import com.boot.demo.Model.SupportTicket;
import com.boot.demo.Model.TicketAdmin;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.SupportTicketRepository;
import com.boot.demo.Repository.TicketAdminRepository;
import com.boot.demo.Repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class SupportTicketService {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TicketAdminRepository ticketAdminRepository;

 // ✅ Create a support ticket and assign a random admin
    public SupportTicket createSupportTicket(int userId, String issueType, String issueDescription) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setIssueType(issueType);
        ticket.setIssueDescription(issueDescription);
        ticket.setStatus("OPEN"); // Default status
        
        return supportTicketRepository.save(ticket);
    }
    
    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAll();
    }

    
 // ✅ Fetch all support tickets for a user based on mobile number
    public List<SupportTicket> getAllTicketsByMobileNumber(String mobileNumber) {
        Optional<User> userOpt = userRepository.findByMobileNumber(mobileNumber);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        return supportTicketRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<SupportTicket> getUserTickets(int userId) {
        return supportTicketRepository.findByUser_UserId(userId);
    }
    
    public List<SupportTicket> getRecentSupportTickets() {
        return supportTicketRepository.findTop4ByOrderByCreatedAtDesc();
    }
    
    public SupportTicket updateTicket(int ticketId, String newStatus, String newPriority) {
        Optional<SupportTicket> ticketOptional = supportTicketRepository.findById(ticketId);
        if (ticketOptional.isPresent()) {
            SupportTicket ticket = ticketOptional.get();
            ticket.setStatus(newStatus);
            ticket.setPriority(newPriority);
            return supportTicketRepository.save(ticket);
        } else {
            throw new EntityNotFoundException("Ticket not found with ID: " + ticketId);
        }
    }
}
