package com.boot.demo.Service;

import com.boot.demo.Model.SupportTicket;
import com.boot.demo.Model.TicketAdmin;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.SupportTicketRepository;
import com.boot.demo.Repository.TicketAdminRepository;
import com.boot.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class TicketAdminService {

    @Autowired
    private TicketAdminRepository ticketAdminRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private UserRepository userRepository;

    public TicketAdmin assignTicketToAdmin(int ticketId, int adminId) {
        Optional<SupportTicket> ticketOpt = supportTicketRepository.findById(ticketId);
        Optional<User> adminOpt = userRepository.findById(adminId);

        if (ticketOpt.isEmpty() || adminOpt.isEmpty()) {
            return null; // Ticket or Admin not found
        }

        TicketAdmin ticketAdmin = new TicketAdmin();
        ticketAdmin.setTicket(ticketOpt.get());
        ticketAdmin.setAdmin(adminOpt.get());

        return ticketAdminRepository.save(ticketAdmin);
    }
}
