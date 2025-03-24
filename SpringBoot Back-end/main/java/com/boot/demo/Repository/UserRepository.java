package com.boot.demo.Repository;

import com.boot.demo.Model.Role;
import com.boot.demo.Model.User;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByMobileNumber(String mobileNumber);
    List<User> findByRole_RoleName(String roleName);
    Optional<User> findByEmail(String email);  // For admin login
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.mobileNumber = :mobileNumber")
    void updateLastLogin(String mobileNumber, LocalDateTime lastLogin);
	User findByfirstName(String username);
}
