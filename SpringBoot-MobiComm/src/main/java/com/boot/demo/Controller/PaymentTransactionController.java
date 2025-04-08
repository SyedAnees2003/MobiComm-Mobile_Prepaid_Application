package com.boot.demo.Controller;

import com.boot.demo.Model.PaymentTransaction;
import com.boot.demo.Model.RechargeHistory;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.RechargeHistoryRepository;
import com.boot.demo.Repository.UserRepository;
import com.boot.demo.Service.EmailService;
import com.boot.demo.Service.PaymentTransactionService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentTransactionController {

    @Autowired
    private PaymentTransactionService paymentTransactionService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;

    @GetMapping
    public ResponseEntity<List<PaymentTransaction>> getAllPayments() {
        return ResponseEntity.ok(paymentTransactionService.getAllTransactions());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<PaymentTransaction>> getUserPayments(@PathVariable int userId) {
        return ResponseEntity.ok(paymentTransactionService.getTransactionsByUser(userId));
    }

    @PostMapping
    public ResponseEntity<?> addPayment(@RequestBody Map<String, Object> request) {
        try {
            int userId = Integer.parseInt(request.get("userId").toString());
            int rechargeId = Integer.parseInt(request.get("rechargeId").toString());
            double amount = Double.parseDouble(request.get("amount").toString());
            String paymentMethod = (String) request.get("paymentMethod");
            String transactionId = (String) request.get("paymentId");

            PaymentTransaction savedTransaction = paymentTransactionService.addPaymentTransaction(userId, rechargeId, amount, paymentMethod,transactionId);

            if (savedTransaction == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ User or Recharge not found.");
            }
            
         // ✅ Fetch User Details
            User user = userRepository.findById(userId).orElse(null);
            RechargeHistory recharge = rechargeHistoryRepository.findById(rechargeId).orElse(null);

            if (user != null && recharge != null) {
                // ✅ Send Email Receipt
                emailService.sendPaymentReceipt(
                    user.getEmail(), 
                    user.getFirstName(), 
                    savedTransaction.getTransactionId().toString(), 
                    amount, 
                    paymentMethod, 
                    recharge.getPlan().getPlanName()
                );
            }

            return ResponseEntity.ok(savedTransaction);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("❌ Invalid data format: " + e.getMessage());
        }
    }
    
    @PostMapping("/save-payment")
    public ResponseEntity<?> savePayment(@RequestBody Map<String, Object> request) {
        try {
            int userId = Integer.parseInt(request.get("userId").toString());
            String paymentId = (String) request.get("paymentId");
            double amount = Double.parseDouble(request.get("amount").toString());

            PaymentTransaction transaction = paymentTransactionService.saveRazorpayPayment(userId, paymentId, amount);

            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error saving payment: " + e.getMessage());
        }
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, String>> createOrder(@RequestBody Map<String, Object> data) throws RazorpayException {
        double amount = Double.parseDouble(data.get("amount").toString());

        RazorpayClient client = new RazorpayClient("rzp_test_XHo8QzIJJiKasb", "wwZrYfBIxXEa7LTPyGun6EnW");

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount * 100));  // Convert to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + UUID.randomUUID());
        orderRequest.put("payment_capture", 1); // Auto capture

        Order order = client.orders.create(orderRequest);

        Map<String, String> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        return ResponseEntity.ok(response);
    }

}
