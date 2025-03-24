package com.boot.demo.Repository;

import com.boot.demo.Model.SupportTicket;
import com.boot.demo.Model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {
    List<SupportTicket> findByUser_UserId(int userId);
    SupportTicket findTopByUserOrderByCreatedAtDesc(User user);  // ✅ Corrected Method
    List<SupportTicket> findByUserOrderByCreatedAtDesc(User user);
    List<SupportTicket> findAll();
    
    @Query("SELECT s FROM SupportTicket s ORDER BY s.createdAt DESC LIMIT 4")
    List<SupportTicket> findTop4ByOrderByCreatedAtDesc(); // Fetch latest 4 tickets
}
