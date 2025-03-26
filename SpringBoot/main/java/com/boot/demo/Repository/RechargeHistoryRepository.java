package com.boot.demo.Repository;

import com.boot.demo.Model.RechargeHistory;
import com.boot.demo.Model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RechargeHistoryRepository extends JpaRepository<RechargeHistory, Integer> {
    List<RechargeHistory> findByUser_UserId(int userId);
    List<RechargeHistory> findTopByUser_UserIdOrderByRechargeDateDesc(int userId);
    Optional<RechargeHistory> findTopByUserOrderByRechargeDateDesc(User user);
    List<RechargeHistory> findByUserOrderByRechargeDateDesc(User user);
    Optional<RechargeHistory> findById(int rechargeId);  // ✅ Ensure this method exists

}
