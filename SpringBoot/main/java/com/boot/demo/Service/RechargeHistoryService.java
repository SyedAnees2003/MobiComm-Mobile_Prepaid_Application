package com.boot.demo.Service;

import com.boot.demo.Model.PaymentTransaction;
import com.boot.demo.Model.RechargeHistory;
import com.boot.demo.Model.RechargePlan;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.PaymentTransactionRepository;
import com.boot.demo.Repository.RechargeHistoryRepository;
import com.boot.demo.Repository.RechargePlanRepository;
import com.boot.demo.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class RechargeHistoryService {

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RechargePlanRepository rechargePlanRepository;
    
    @Autowired
    PaymentTransactionRepository paymentTransactionRepository;

    public List<RechargeHistory> getAllRechargeHistory() {
        return rechargeHistoryRepository.findAll();
    }

    public Page<RechargeHistory> getRechargeHistory(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.isEmpty()) {
            return rechargeHistoryRepository.searchRechargeHistory(search, pageable);
        }
        return rechargeHistoryRepository.findAll(pageable);
    }
    
    public List<RechargeHistory> getRechargeHistoryByUser(int userId) {
        return rechargeHistoryRepository.findByUser_UserId(userId);
    }
    
    public Optional<RechargeHistory> getRechargeById(int rechargeId) {
        return rechargeHistoryRepository.findById(rechargeId);
    }

    public RechargeHistory addRecharge(int userId, int planId, double amount, String rechargeMode, String transactionId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<RechargePlan> planOpt = rechargePlanRepository.findById(planId);
        
        if (userOpt.isEmpty() || planOpt.isEmpty()) {
            return null; // Invalid User or Plan
        }

        // ✅ Create Recharge Entry
        RechargeHistory recharge = new RechargeHistory();
        recharge.setUser(userOpt.get());
        recharge.setPlan(planOpt.get());
        recharge.setAmount(BigDecimal.valueOf(amount)); // ✅ Convert double to BigDecimal
        recharge.setRechargeMode(rechargeMode);
        recharge.setStatus("successful");
        
        RechargeHistory savedRecharge = rechargeHistoryRepository.save(recharge);
        
     // ✅ Set Transaction Reference
        
        // ✅ Ensure User Details Are Returned in JSON Response
//        savedRecharge.getUser().setPasswordHash(null); // Hide Password in Response
        return savedRecharge;
    }
    
    public List<RechargeHistory> getLatestRecharge(int userId) {
        return rechargeHistoryRepository.findTopByUser_UserIdOrderByRechargeDateDesc(userId);
    }
    
    public boolean deleteRechargeById(int rechargeId) {
        if (rechargeHistoryRepository.existsById(rechargeId)) {
            rechargeHistoryRepository.deleteById(rechargeId);
            return true;
        }
        return false;
    }
}
