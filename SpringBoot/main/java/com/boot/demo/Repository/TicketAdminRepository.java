package com.boot.demo.Repository;

import com.boot.demo.Model.TicketAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketAdminRepository extends JpaRepository<TicketAdmin, Integer> {
}
