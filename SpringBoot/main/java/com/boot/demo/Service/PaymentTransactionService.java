package com.boot.demo.Service;

import com.boot.demo.Model.PaymentTransaction;
import com.boot.demo.Model.RechargeHistory;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.PaymentTransactionRepository;
import com.boot.demo.Repository.RechargeHistoryRepository;
import com.boot.demo.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentTransactionService {

	 @Autowired
	    private PaymentTransactionRepository paymentTransactionRepository;

	    @Autowired
	    private UserRepository userRepository;

	    @Autowired
	    private RechargeHistoryRepository rechargeHistoryRepository;

    public List<PaymentTransaction> getAllTransactions() {
        return paymentTransactionRepository.findAll();
    }

    public List<PaymentTransaction> getTransactionsByUser(int userId) {
        return paymentTransactionRepository.findByUser_UserId(userId);
    }

    public PaymentTransaction addTransaction(PaymentTransaction transaction) {
        return paymentTransactionRepository.save(transaction);
    }
    
 // ✅ Save New Payment Transaction
    public PaymentTransaction addPaymentTransaction(int userId, int rechargeId, double amount, String paymentMethod, String transactionId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<RechargeHistory> rechargeOpt = rechargeHistoryRepository.findById(rechargeId);

        if (userOpt.isEmpty() || rechargeOpt.isEmpty()) {
            return null; // ❌ User or Recharge not found
        }

        PaymentTransaction paymentTransaction = new PaymentTransaction();
        
        paymentTransaction.setUser(userOpt.get());
        paymentTransaction.setRecharge(rechargeOpt.get());
        paymentTransaction.setAmount(BigDecimal.valueOf(amount));
        paymentTransaction.setPaymentMethod(paymentMethod);
        paymentTransaction.setTransactionReferenceId(transactionId);
        
        paymentTransaction.setTransactionType("Recharge");
        paymentTransaction.setStatus("successful");

        return paymentTransactionRepository.save(paymentTransaction);
    }
    
 // ✅ Save Razorpay Payment
    public PaymentTransaction saveRazorpayPayment(int userId, String paymentId, double amount) {
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found!");
        }

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setUser(user); // ✅ Pass User object
        transaction.setAmount(BigDecimal.valueOf(amount)); // ✅ Convert double to BigDecimal

        transaction.setPaymentMethod("razorpay");
        transaction.setTransactionType("Recharge");
        transaction.setStatus("successful");
        transaction.setTransactionReferenceId(paymentId);

        return paymentTransactionRepository.save(transaction);
    }
}
