package com.boot.demo.Repository;

import com.boot.demo.Model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByUser_UserId(int userId);

	Optional<PaymentTransaction> findByTransactionReferenceId(String transactionId);
}
