package com.boot.demo.Repository;

import com.boot.demo.Model.Notifications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notifications, Integer> {
    List<Notifications> findByUserUserId(int userId);
    List<Notifications> findByStatus(String status);
}
