package com.boot.demo.Repository;

import com.boot.demo.Model.RechargeHistory;
import com.boot.demo.Model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

 // 🔍 Search by Recharge ID, User Name, Payment Mode, or Plan Name
    @Query("SELECT r FROM RechargeHistory r " +
    	       "WHERE LOWER(CAST(r.rechargeId AS string)) LIKE LOWER(CONCAT('%', :query, '%')) " +
    	       "OR LOWER(r.user.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
    	       "OR LOWER(r.user.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
    	       "OR LOWER(r.rechargeMode) LIKE LOWER(CONCAT('%', :query, '%')) " +
    	       "OR LOWER(r.plan.planName) LIKE LOWER(CONCAT('%', :query, '%'))")  // ✅ Fixed planName reference
    	Page<RechargeHistory> searchRechargeHistory(@Param("query") String query, Pageable pageable);


}
