package com.boot.demo.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.demo.Model.Address;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.AddressRepository;
import com.boot.demo.Repository.UserRepository;
import com.boot.demo.Security.JwtUtil;
import com.boot.demo.Service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AddressRepository addressRepository;

    // ✅ Fetch Admin Profile (Including Address)
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.getUsernameFromToken(token.substring(7));
        Optional<User> adminOpt = userService.findByEmail(email);

        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Admin not found.");
        }

        User admin = adminOpt.get();
        Optional<Address> addressOpt = addressRepository.findByUser(admin);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", admin.getUserId());
        response.put("firstName", admin.getFirstName());
        response.put("lastName", admin.getLastName());
        response.put("mobileNumber", admin.getMobileNumber());
        response.put("email", admin.getEmail());
        response.put("customerId", admin.getUserId());
        response.put("dob", admin.getDateOfBirth());
        response.put("lastLogin", admin.getLastLogin());

        // ✅ Include Address if Available
        if (addressOpt.isPresent()) {
            Address address = addressOpt.get();
            response.put("street", address.getStreet());
            response.put("city", address.getCity());
            response.put("state", address.getState());
            response.put("zipCode", address.getZipCode());
        } else {
            response.put("address", "Not available");
        }

        return ResponseEntity.ok(response);
    }

    // ✅ Update Admin Profile (Including Address)
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateAdminProfile(
        @RequestHeader("Authorization") String token,
        @RequestBody Map<String, String> updatedData) {

        String email = jwtUtil.getUsernameFromToken(token.substring(7));
        Optional<User> adminOpt = userService.findByEmail(email);

        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found.");
        }

        User admin = adminOpt.get();

        // ✅ Update Email & Mobile Number
        admin.setMobileNumber(updatedData.get("mobileNumber"));
        admin.setEmail(updatedData.get("email"));

        // ✅ Update Address
        Optional<Address> addressOpt = addressRepository.findByUser(admin);
        Address address = addressOpt.orElse(new Address());
        address.setUser(admin);
        address.setStreet(updatedData.getOrDefault("street", address.getStreet()));
        address.setCity(updatedData.getOrDefault("city", address.getCity()));
        address.setState(updatedData.getOrDefault("state", address.getState()));
        address.setZipCode(updatedData.getOrDefault("zipCode", address.getZipCode()));

        // ✅ Save Updates
        userRepository.save(admin);
        addressRepository.save(address);

        return ResponseEntity.ok("Profile updated successfully.");
    }
}
