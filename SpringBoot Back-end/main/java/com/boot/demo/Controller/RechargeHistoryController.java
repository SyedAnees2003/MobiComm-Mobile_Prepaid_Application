package com.boot.demo.Controller;

import com.boot.demo.Model.RechargeHistory;
import com.boot.demo.Service.RechargeHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/recharge-history")
@CrossOrigin(origins = "*")
public class RechargeHistoryController {

    @Autowired
    private RechargeHistoryService rechargeHistoryService;
    
    

    @GetMapping
    public ResponseEntity<List<RechargeHistory>> getAllRecharges() {
        return ResponseEntity.ok(rechargeHistoryService.getAllRechargeHistory());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<RechargeHistory>> getUserRechargeHistory(@PathVariable int userId) {
        return ResponseEntity.ok(rechargeHistoryService.getRechargeHistoryByUser(userId));
    }
    
 // ✅ Get Single Recharge by Recharge ID
    @GetMapping("/recharge/{rechargeId}")
    public ResponseEntity<?> getRechargeById(@PathVariable int rechargeId) {
        Optional<RechargeHistory> recharge = rechargeHistoryService.getRechargeById(rechargeId);
        if (recharge.isPresent()) {
            return ResponseEntity.ok(recharge.get()); // ✅ Returns RechargeHistory object
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "❌ Recharge not found.")); 
            // ✅ Returns a JSON object instead of a plain string
        }    
     }

    @PostMapping
    public ResponseEntity<?> addRecharge(@RequestBody Map<String, Object> request) {
        try {
            // ✅ Convert `userId` and `planId` properly from Object to Integer
            int userId = Integer.parseInt(request.get("userId").toString());
            int planId = Integer.parseInt(request.get("planId").toString());
            double amount = Double.parseDouble(request.get("amount").toString());
            String rechargeMode = (String) request.get("rechargeMode");
            String transactionId = request.containsKey("transactionId") ? (request.get("transactionId").toString()) : null;


            // ✅ Call Service Layer
            RechargeHistory savedRecharge = rechargeHistoryService.addRecharge(userId, planId, amount, rechargeMode, transactionId);

            if (savedRecharge == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User or Plan not found.");
            }

            return ResponseEntity.ok(savedRecharge);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid data format: " + e.getMessage());
        }
    }

    
 // ✅ Delete Recharge Entry (Admin only)
    @DeleteMapping("/delete/{rechargeId}")
    public ResponseEntity<?> deleteRecharge(@PathVariable int rechargeId) {
        boolean isDeleted = rechargeHistoryService.deleteRechargeById(rechargeId);
        if (isDeleted) {
            return ResponseEntity.ok("✅ Recharge entry deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Recharge not found.");
        }
    }
}
