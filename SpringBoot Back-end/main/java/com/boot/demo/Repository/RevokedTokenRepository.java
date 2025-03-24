package com.boot.demo.Repository;

import com.boot.demo.Model.RevokedToken;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByToken(String token);
    Optional<RevokedToken> findByToken(String token);  // ✅ Custom Query
}
