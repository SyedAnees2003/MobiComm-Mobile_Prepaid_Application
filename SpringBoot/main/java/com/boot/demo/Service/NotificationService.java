package com.boot.demo.Service;

import com.boot.demo.Model.Notifications;
import com.boot.demo.Model.User;
import com.boot.demo.Repository.NotificationRepository;
import com.boot.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired 
    private EmailService emailService;
    

    // Fetch all notifications
    public List<Notifications> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Fetch notifications for a specific user
    public List<Notifications> getUserNotifications(int userId) {
        return notificationRepository.findByUserUserId(userId);
    }

    public String sendNotification(String mobile, String message) {
        Optional<User> userOptional = userRepository.findByMobileNumber(mobile);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Notifications notification = new Notifications();
            notification.setUser(user);
            notification.setNotifyType("Support Message");
            notification.setMessage(message);
            notification.setStatus("active");
            notification.setPreferenceStatus("enabled");
            notification.setReadStatus("unread");

            notificationRepository.save(notification);
            return "Notification sent successfully!";
        } else {
            return "User not found!";
        }
    }

    // Mark notification as read
    public Notifications markAsRead(int notificationId) {
        Optional<Notifications> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notifications notification = optionalNotification.get();
            notification.setReadStatus("read");
            return notificationRepository.save(notification);
        } else {
            throw new RuntimeException("Notification not found");
        }
    }

    // Delete notification
    public void deleteNotification(int notificationId) {
        notificationRepository.deleteById(notificationId);
    }

	public String sendRechargeNotification(String mobile, String message) {
		Optional<User> userOptional = userRepository.findByMobileNumber(mobile);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Notifications notification = new Notifications();
            notification.setUser(user);
            notification.setNotifyType("Recharge Success");
            notification.setMessage(message);
            notification.setStatus("active");
            notification.setPreferenceStatus("enabled");
            notification.setReadStatus("unread");

            notificationRepository.save(notification);
            return "Notification sent successfully!";
        } else {
            return "User not found!";
        }
	}

	public String sendEmailNotification(String mobile, String message) {
		
		Optional<User> userOptional = userRepository.findByMobileNumber(mobile);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Notifications notification = new Notifications();
            notification.setUser(user);
            notification.setNotifyType("Support Message");
            notification.setMessage(message);
            notification.setStatus("active");
            notification.setPreferenceStatus("enabled");
            notification.setReadStatus("unread");
            
            

            emailService.sendExpiryAlertEmail(user.getEmail(), user.getFirstName(), user.getMobileNumber(), user.getRechargeHistoryList());      
            return "Notification sent successfully!";
        } else {
            return "User not found!";
        }
	}
}
