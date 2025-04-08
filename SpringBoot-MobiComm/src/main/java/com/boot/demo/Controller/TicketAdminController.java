package com.boot.demo.Controller;

import com.boot.demo.Model.TicketAdmin;
import com.boot.demo.Service.TicketAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/ticket-admins")
@CrossOrigin(origins = "*")
public class TicketAdminController {

    @Autowired
    private TicketAdminService ticketAdminService;

    @PostMapping("/assign")
    public ResponseEntity<?> assignTicket(@RequestBody Map<String, Integer> request) {
        int ticketId = request.get("ticketId");
        int adminId = request.get("adminId");

        TicketAdmin assignedTicket = ticketAdminService.assignTicketToAdmin(ticketId, adminId);
        if (assignedTicket == null) {
            return ResponseEntity.badRequest().body("❌ Ticket or Admin not found.");
        }

        return ResponseEntity.ok(assignedTicket);
    }
}
