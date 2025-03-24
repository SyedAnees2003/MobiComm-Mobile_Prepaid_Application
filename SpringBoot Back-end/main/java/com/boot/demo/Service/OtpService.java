package com.boot.demo.Service;

import com.boot.demo.Config.TwilioConfig;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    @Autowired
    private TwilioConfig twilioConfig;

    // ✅ Send OTP using Twilio Verify API
    public String sendOtp(String mobileNumber) {
        Verification verification = Verification.creator(
                twilioConfig.getVerifyServiceSid(),
                "+91" + mobileNumber,  // Recipient Number
                "sms"  // Delivery method
        ).create();

        return "✅ OTP Sent Successfully! Status: " + verification.getStatus();
    }
    
    
 // ✅ Verify OTP using Twilio Verify API
    public boolean verifyOtp(String mobileNumber, String otp) {
        VerificationCheck verificationCheck = VerificationCheck.creator(
                twilioConfig.getVerifyServiceSid()
        ).setTo("+91" + mobileNumber) // Recipient
         .setCode(otp) // OTP Code
         .create();

        return "approved".equals(verificationCheck.getStatus());
    }
}
