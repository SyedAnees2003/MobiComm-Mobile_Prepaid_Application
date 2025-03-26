package com.boot.demo.Controller;

import com.boot.demo.Model.User;
import com.boot.demo.Exception.UserNotFoundException;
import com.boot.demo.Model.Address;
import com.boot.demo.Model.RechargeHistory;
import com.boot.demo.Model.RechargePlan;
import com.boot.demo.Model.StatusType;
import com.boot.demo.Repository.AddressRepository;
import com.boot.demo.Repository.RechargeHistoryRepository;
import com.boot.demo.Repository.StatusTypeRepository;
import com.boot.demo.Repository.UserRepository;
import com.boot.demo.Security.JwtUtil;
import com.boot.demo.Service.RechargeHistoryService;
import com.boot.demo.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
	
	@Autowired
    private JwtUtil jwtUtil;
	
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RechargeHistoryService rechargeHistoryService;
    
    @Autowired
    private RechargeHistoryRepository rechargeHistoryRepository;
    
    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private StatusTypeRepository statusTypeRepository;

    // UPDATE ADMIN PASSWORD
    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));  // Hash the new password
        userRepository.save(user);
        return ResponseEntity.ok("✅ Password updated successfully!");
    }
    
 // Get User Details
    @GetMapping("/{mobileNumber}")
    public ResponseEntity<?> getUserDetails(@PathVariable String mobileNumber) {
    	User user = userService.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        Optional<Address> addressOptional = addressRepository.findByUser(user);
        String statusName = user.getStatus() != null ? user.getStatus().getStatusName() : "Unknown";
        if (user.getStatus() != null && (user.getStatus().getStatusId() == 3 || user.getStatus().getStatusId() == 4)) {
            statusName = "Blocked"; 
        }

    	    Map<String, Object> userResponse = new HashMap<>();
    	    userResponse.put("userId", user.getUserId());
    	    userResponse.put("mobileNumber", user.getMobileNumber());
    	    userResponse.put("email", user.getEmail());
    	    userResponse.put("firstName", user.getFirstName());
    	    userResponse.put("lastName", user.getLastName());
    	    userResponse.put("status", statusName);
    	    userResponse.put("lastLogin", user.getLastLogin());
    	    userResponse.put("dob", user.getDateOfBirth());
    	    
    	    // Include Address if Available
    	    if (addressOptional.isPresent()) {
    	        Address address = addressOptional.get();
    	        userResponse.put("street", address.getStreet());
    	        userResponse.put("city", address.getCity());
    	        userResponse.put("state", address.getState());
    	        userResponse.put("zipCode", address.getZipCode());
    	    } else {
    	        userResponse.put("address", "Not available");
    	    }

    	    return ResponseEntity.ok(userResponse);
    }

 // Fetch Recent Recharge (Ensures Authorization)
    @GetMapping("/{mobileNumber}/recent-recharge")
    public ResponseEntity<?> getRecentRecharge(@PathVariable String mobileNumber, @RequestHeader("Authorization") String token) {

//        System.out.println("🔹 JWT Token Received: " + token);

    	 User user = userRepository.findByMobileNumber(mobileNumber)
                 .orElseThrow(() -> new UserNotFoundException("User not found!"));

         RechargeHistory recharge = rechargeHistoryRepository.findTopByUserOrderByRechargeDateDesc(user)
                 .orElseThrow(() -> new UserNotFoundException("No recent recharge found!"));

         RechargePlan plan = recharge.getPlan();
         if (plan == null) {
             throw new RuntimeException("❌ Plan details missing for recharge.");
         }

        // Create a response object that includes both Recharge and Plan details
        Map<String, Object> response = new HashMap<>();
        response.put("rechargeId", recharge.getRechargeId());
        response.put("amount", recharge.getAmount());
        response.put("status", recharge.getStatus());
        response.put("rechargeMode", recharge.getRechargeMode());
        response.put("rechargeDate", recharge.getRechargeDate());
        
        response.put("userName", user.getFirstName() + " " + user.getLastName());
        
        // Include Plan Details
        Map<String, Object> planDetails = new HashMap<>();
        planDetails.put("planName", plan.getPlanName());
        planDetails.put("validityDays", plan.getValidityDays());
        planDetails.put("price", plan.getPrice());
        planDetails.put("data", plan.getData());
        planDetails.put("sms", plan.getSms());
        planDetails.put("calls", plan.getCalls());
        planDetails.put("benefits", plan.getAdditionalBenefits());
        
        response.put("plan", planDetails);

        return ResponseEntity.ok(response);  // ✅ Return structured JSON
    }
    
 // UPDATE USER PROFILE
    @PutMapping("/{mobileNumber}/update-profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String mobileNumber,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> updates) {

        System.out.println("🔹 JWT Token Received: " + token);

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Missing or Invalid token format.");
        }

        String jwtToken = token.substring(7); // Remove "Bearer " prefix

        if (!jwtUtil.validateToken(jwtToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid token.");
        }

        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new UserNotFoundException("User not found!"));

        // ✅ Update Email
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        userRepository.save(user); // Save user changes

        // ✅ Handle Address Update
        if (updates.containsKey("address")) {
            Map<String, String> addressData = (Map<String, String>) updates.get("address");
            Address address = addressRepository.findByUser_UserId(user.getUserId())
                    .orElse(new Address());

            address.setUser(user);
            address.setStreet(addressData.get("street"));
            address.setCity(addressData.get("city"));
            address.setState(addressData.get("state"));
            address.setZipCode(addressData.get("zipCode"));

            addressRepository.save(address);
        }
        return ResponseEntity.ok("✅ Profile updated successfully.");
    }


    
 @GetMapping("/{mobileNumber}/recharge-history")
 public ResponseEntity<?> getRechargeHistory(@PathVariable String mobileNumber, @RequestHeader("Authorization") String authHeader) {

	    System.out.println("🔹 JWT Token Received: " + authHeader);

	    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Missing or invalid Authorization header.");
	    }

	    String token = authHeader.substring(7);  // ✅ Extract token part

	    if (!jwtUtil.validateToken(token)) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid token.");
	    }

	    Optional<User> user = userRepository.findByMobileNumber(mobileNumber);
	    if (user.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ User not found.");
	    }

	    List<RechargeHistory> rechargeHistory = rechargeHistoryRepository.findByUserOrderByRechargeDateDesc(user.get());
	 // ✅ Convert to JSON response with plan details
	    List<Map<String, Object>> formattedHistory = rechargeHistory.stream().map(recharge -> {
	        Map<String, Object> historyItem = new HashMap<>();
	        historyItem.put("rechargeId", recharge.getRechargeId());
	        historyItem.put("amount", recharge.getAmount());
	        historyItem.put("status", recharge.getStatus());
	        historyItem.put("rechargeMode", recharge.getRechargeMode());
	        historyItem.put("rechargeDate", recharge.getRechargeDate());

	        historyItem.put("user", Map.of(
	                "firstName", recharge.getUser().getFirstName(),
	                "lastName", recharge.getUser().getLastName()   // 🔹 Adding first name
	            ));
	        
	        // ✅ Include Plan Details
	        if (recharge.getPlan() != null) {
	            historyItem.put("planName", recharge.getPlan().getPlanName());
	            historyItem.put("validityDays", recharge.getPlan().getValidityDays());
	        } else {
	            historyItem.put("planName", "N/A");
	            historyItem.put("validityDays", "N/A");
	        }
	        
	        return historyItem;
	    }).toList();

	    return ResponseEntity.ok(formattedHistory);
	}
 
//✅ Fetch All Users with Status Name
@GetMapping
public ResponseEntity<?> getAllUsers() {
  List<User> users = userRepository.findAll();
  
  List<Map<String, Object>> userList = users.stream().map(user -> {
      String statusName = user.getStatus() != null ? user.getStatus().getStatusName() : "Unknown";
      if (user.getStatus() != null && (user.getStatus().getStatusId() == 3 || user.getStatus().getStatusId() == 4)) {
          statusName = "Blocked"; // Convert Suspended/Pending to Blocked
      }

      Map<String, Object> userMap = new HashMap<>();
      userMap.put("userId", user.getUserId());
      userMap.put("mobileNumber", user.getMobileNumber());
      userMap.put("email", user.getEmail());
      userMap.put("firstName", user.getFirstName());
      userMap.put("lastName", user.getLastName());
      userMap.put("status", statusName);
	  userMap.put("createdAt", user.getCreatedAt());

      return userMap;
  }).toList();

  return ResponseEntity.ok(userList);
}

//✅ Update User Status
@PutMapping("/{mobileNumber}/update-status")
public ResponseEntity<?> updateUserStatus(
        @PathVariable String mobileNumber,
        @RequestHeader("Authorization") String token,
        @RequestBody Map<String, Object> updates) {

    System.out.println("🔹 JWT Token Received: " + token);

    User user = userRepository.findByMobileNumber(mobileNumber)
            .orElseThrow(() -> new UserNotFoundException("User not found!"));
    // ✅ Update Email (if provided)
    if (updates.containsKey("email")) {
        user.setEmail((String) updates.get("email"));
    }

    // ✅ Update Status (if provided)
    if (updates.containsKey("statusId")) {
        int newStatusId = (int) updates.get("statusId");
        StatusType newStatus = statusTypeRepository.findById(newStatusId)
                .orElseThrow(() -> new IllegalArgumentException("❌ Invalid status ID."));

        user.setStatus(newStatus);
    }

    userRepository.save(user);
    return ResponseEntity.ok("✅ User updated successfully.");
}
}
