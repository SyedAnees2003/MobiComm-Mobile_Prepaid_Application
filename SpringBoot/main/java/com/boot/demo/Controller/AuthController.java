package com.boot.demo.Controller;

import com.boot.demo.Exception.InvalidCredentialsException;
import com.boot.demo.Exception.TokenException;
import com.boot.demo.Model.RevokedToken;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.RevokedTokenRepository;
import com.boot.demo.Repository.UserRepository;
import com.boot.demo.Security.JwtUtil;
import com.boot.demo.Service.OtpService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")  // ✅ Allow frontend access
public class AuthController {
	
	 @Autowired
	    private OtpService otpService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RevokedTokenRepository revokedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ USER LOGIN (Mobile Number - NO Password)
    @PostMapping("/user-login")
    public ResponseEntity<?> userLogin(@RequestBody Map<String, String> loginRequest) {
        String mobileNumber = loginRequest.get("mobile_number");

        return userRepository.findByMobileNumber(mobileNumber).map(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtUtil.generateToken(mobileNumber, "ROLE_USER");
            return ResponseEntity.ok(Map.of(
                "accessToken", token,
                "role", "ROLE_USER",
                "lastLogin", user.getLastLogin()
            ));
        }).orElseThrow(() -> new InvalidCredentialsException("Invalid mobile number."));
    }
    

    // ✅ ADMIN LOGIN (Email & Password)
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        return userRepository.findByEmail(email)
            .filter(admin -> passwordEncoder.matches(password, admin.getPasswordHash()))
            .map(admin -> {
                String token = jwtUtil.generateToken(admin.getEmail(), "ROLE_ADMIN");
                return ResponseEntity.ok(Map.of("accessToken", token, "role", "ROLE_ADMIN"));
            })
            .orElseThrow(() -> new InvalidCredentialsException("Invalid admin credentials."));
    }
    
    
 // ✅ LOGOUT & TOKEN REVOCATION
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new TokenException("❌ Invalid token format.");
        }
        
        token = token.substring(7); // Remove "Bearer " prefix

        if (revokedTokenRepository.findByToken(token).isPresent()) {
            throw new TokenException("❌ Token is already revoked.");
        }

        revokedTokenRepository.save(new RevokedToken(token));
        return ResponseEntity.ok("✅ Logged out successfully.");
    }
    
    // ✅ Send OTP to Mobile Number
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String mobileNumber = request.get("mobile_number");

        try {
            String response = otpService.sendOtp(mobileNumber);
            return ResponseEntity.ok(Map.of("message", response));
        } catch (Exception ex) {
            throw new RuntimeException("❌ Failed to send OTP. Try again.");
        }
    }

    // ✅ Verify OTP and Log in
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String mobileNumber = request.get("mobile_number");
        String otp = request.get("otp");

        if (otpService.verifyOtp(mobileNumber, otp)) {
            return ResponseEntity.ok(Map.of("message", "✅ OTP Verified!"));
        }

        throw new InvalidCredentialsException("❌ Invalid OTP.");
    }

}
