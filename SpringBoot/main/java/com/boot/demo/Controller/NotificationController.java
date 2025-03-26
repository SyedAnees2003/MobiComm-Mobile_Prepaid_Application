package com.boot.demo.Controller;

import com.boot.demo.Exception.NotificationNotFoundException;
import com.boot.demo.Exception.UserNotFoundException;
import com.boot.demo.Model.Notifications;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.NotificationRepository;
import com.boot.demo.Repository.UserRepository;
import com.boot.demo.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired 
    private UserRepository userRepository;

    // Fetch all notifications
    @GetMapping
    public List<Notifications> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @GetMapping("/user/{mobile}")
    public ResponseEntity<List<Notifications>> getUserNotifications(@PathVariable String mobile) {
    	 User user = userRepository.findByMobileNumber(mobile)
                 .orElseThrow(() -> new UserNotFoundException("User with mobile " + mobile + " not found"));

         List<Notifications> notifications = notificationRepository.findByUserUserId(user.getUserId());

         if (notifications.isEmpty()) {
             throw new NotificationNotFoundException("No notifications found for user " + mobile);
         }

         return ResponseEntity.ok(notifications);
    }


    @PostMapping
    public ResponseEntity<String> sendNotification(@RequestBody Map<String, String> requestBody) {
        String mobile = requestBody.get("mobile");
        String message = requestBody.get("message");

        if (mobile == null || message == null) {
            return ResponseEntity.badRequest().body("Mobile number and message are required!");
        }

        String response = notificationService.sendNotification(mobile, message);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/recharge")
    public ResponseEntity<String> sendRechargeNotification(@RequestBody Map<String, String> requestBody) {
        String mobile = requestBody.get("mobile");
        String message = requestBody.get("message");

        if (mobile == null || message == null) {
            return ResponseEntity.badRequest().body("Mobile number and message are required!");
        }

        String response = notificationService.sendRechargeNotification(mobile, message);
        return ResponseEntity.ok(response);
    }

    // Mark notification as read
    @PutMapping("/mark-as-read/{notificationId}")
    public Notifications markAsRead(@PathVariable int notificationId) {
        return notificationService.markAsRead(notificationId);
    }

    // Delete a notification
    @DeleteMapping("/delete/{notificationId}")
    public void deleteNotification(@PathVariable int notificationId) {
        notificationService.deleteNotification(notificationId);
    }
}
