package com.boot.demo.Repository;

import com.boot.demo.Model.Address;
import com.boot.demo.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    Optional<Address> findByUser(User user);
    Optional<Address> findByUser_UserId(int userId);  // ✅ Correct way
}
