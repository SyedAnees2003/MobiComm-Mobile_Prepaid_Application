let lastScrollTop = 0;
const navbar = document.querySelector("header");

window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop) {
        // Scrolling down → Hide navbar
        navbar.style.top = "-88px"; // Adjust based on navbar height
    } else {
        // Scrolling up → Show navbar
        navbar.style.top = "0";
    }

    lastScrollTop = currentScroll;
});

// Scroll to Top Button
var scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.onscroll = function () {
    if (document.documentElement.scrollTop > 400 || document.body.scrollTop > 400) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Auto-Fill Mobile Number if Previously Stored
document.addEventListener("DOMContentLoaded", function () {
    let mobileInput = document.getElementById("mobile");
    let storedMobile = localStorage.getItem("userMobile");

    if (storedMobile) {
        mobileInput.value = storedMobile;
        validateMobileNumber();
    }
});

// Mobile Number Validation & DB Check
function validateMobileNumber() {
    const mobileInput = document.getElementById("mobile");
    const mobileNumber = mobileInput.value.trim();
    const mobileError = document.getElementById("mobileError");
    const sendOTPButton = document.getElementById("sendOTPMobile");
    const regex = /^\d{10}$/;

    if (regex.test(mobileNumber)) {
        mobileError.style.display = "none";
        sendOTPButton.disabled = false;
        checkMobileInDB(mobileNumber);
    } else {
        document.querySelectorAll(".btn-custom").forEach((btn) => (btn.disabled = true));
        mobileError.style.display = "inline";
        sendOTPButton.disabled = true;
    }
}

// Check if Mobile Number Exists in DB
function checkMobileInDB(mobileNumber) {
    fetch("http://localhost:8083/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber }),
    })
        .then((response) => {
            if (!response.ok) throw new Error("Mobile number not found.");
            return response.json();
        })
        .then(() => {
            document.getElementById("sendOTPMobile").disabled = false;
        })
        .catch((error) => {
            console.error("❌ Login Error:", error);
            mobileError.textContent = "Mobile number not found.";
            mobileError.style.display = "inline";
            document.getElementById("sendOTPMobile").disabled = true;
        });
}

// Send OTP (Simulated Here)
// Enable OTP Fields and Send OTP
function sendOTP() {
    const mobileNumber = document.getElementById("mobile").value.trim();

    const sendOTPButton = document.getElementById("sendOTPMobile");

    // Disable button and show spinner
    sendOTPButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Sending OTP...`;
    sendOTPButton.disabled = true;

    fetch("http://localhost:8083/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("OTP Sent:", data);
        document.getElementById("otpSection").style.display = "block";
        document.querySelectorAll(".otp-input").forEach(input => input.disabled = false);
        document.getElementById("otpMobileNumber").textContent = mobileNumber;

        document.getElementById("sendOTPMobile").textContent = "Sending OTP...";

         // Open the OTP Sent Modal
         let otpSentModal = new bootstrap.Modal(document.getElementById("otpSentModal"));
         otpSentModal.show();

          // Wait 2 seconds before resetting button text
        setTimeout(() => {
            sendOTPButton.innerHTML = "Send OTP";
            sendOTPButton.disabled = false;
        }, 2000);
    })
    .catch(error =>{ console.error("OTP Send Error:", error);
    sendOTPButton.innerHTML = "Send OTP";
    showToast("Failed to send OTP. Try again!", false);
    sendOTPButton.disabled = false;
});
}

// Move to the Next Input Field Automatically
function moveToNextInput(input) {
    if (input.value.length === 1) {
        const nextInput = input.nextElementSibling;
        if (nextInput && nextInput.classList.contains("otp-input")) {
            nextInput.focus();
        }
    }
    validateOTP();
}

function validateOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");
    const otpError = document.getElementById("otpError");
    const verifyOTPButton = document.getElementById("verifyOtpButton");
    let otp = "";

    otpInputs.forEach(input => otp += input.value.trim());

    if (/^\d{4}$/.test(otp)) {
        otpError.style.display = "none";
        verifyOTPButton.disabled = false;
    } else {
        otpError.style.display = "inline";
        verifyOTPButton.disabled = true;
    }
}

// Verify OTP and Proceed to Login
function verifyOTP() {
    const mobileNumber = document.getElementById("mobile").value.trim();
    const otpInputs = document.querySelectorAll(".otp-input");
    const verifyOTPButton = document.getElementById("verifyOtpButton");
    let otp = "";

    otpInputs.forEach(input => otp += input.value.trim());

    // Disable button and show spinner
    verifyOTPButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Verifying OTP...`;
    verifyOTPButton.disabled = true;

    fetch("http://localhost:8083/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber, otp: otp }),
    })
    .then(response => {
        if (!response.ok) throw new Error("Invalid OTP.");
        return response.json();
    })
    .then(data => {
        console.log("✅ OTP Verified:", data);

        document.getElementById("verifyOtpButton").textContent = "Verifying OTP..."

        sessionStorage.setItem("userToken", data.accessToken);
        sessionStorage.setItem("userRole", data.role);
        sessionStorage.setItem("mobileNumber", mobileNumber);
        localStorage.setItem("userMobile", mobileNumber);
        // Enable login button after verification
        document.getElementById("login-button").disabled = false;

        // Wait 2 seconds before resetting button text
        setTimeout(() => {
            verifyOTPButton.innerHTML = "Verify OTP";
            verifyOTPButton.disabled = false;
        }, 2000);

        showToast("OTP Verified Successfully!", true);

    })
    .catch(error => {
        console.error("❌ OTP Verification Failed:", error);
        showToast("Invalid OTP. Please try again.", false);
        verifyOTPButton.innerHTML = "Verify OTP";
        verifyOTPButton.disabled = false;
    });
}

function showToast(message, isSuccess) {
    const toastContainer = document.getElementById("customVerifyToast");
    const toastIcon = toastContainer.querySelector(".toast-icon");
    const toastMessage = toastContainer.querySelector(".toast-message");

    // Update message & styles
    toastMessage.textContent = message;
    toastIcon.innerHTML = isSuccess ? " ✅" : " ❌"; // Checkmark for success, Cross for error

    // Show toast
    toastContainer.style.opacity = "1";
    toastContainer.style.transform = "translateY(0)";

    // Hide after 3 seconds
    setTimeout(() => {
        toastContainer.style.opacity = "0";
        toastContainer.style.transform = "translateY(-20px)";
    }, 3000);
}


// Login Functionality
document.getElementById("login-button").addEventListener("click", function (event) {
    event.preventDefault();
    const mobileNumber = document.getElementById("mobile").value.trim();

    let loginButton = this;

        // Change text to "Logging in..."
        loginButton.textContent = "Logging in...";
        loginButton.disabled = true; // Prevent multiple clicks

        // After 2 seconds, revert back to "Login"
        setTimeout(() => {
            loginButton.textContent = "Login";
            loginButton.disabled = false; // Re-enable the button if needed
        }, 2000);

    fetch("http://localhost:8083/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber }),
    })
        .then((response) => {
            if (!response.ok) throw new Error("Invalid OTP.");
            return response.json();
        })
        .then((data) => {
            console.log("✅ Login Successful:", data);
        sessionStorage.setItem("userToken", data.accessToken); // ✅ Store token
        sessionStorage.setItem("userRole", data.role); // ✅ Store role
        sessionStorage.setItem("mobileNumber", mobileNumber); // ✅ Correct key
        localStorage.setItem("userMobile",mobileNumber);
        showLoginSuccess(); 
        setTimeout(() => {
        window.location.href = "subscriber.html";
        }, 2000); // Redirect to dashboard
        })
        .catch((error) => {
            console.error("❌ Login Failed:", error);
            showLoginFailure();            
        });
});

function showLoginSuccess() {
    let toastElement = document.getElementById("customToast");

    // Show toast
    toastElement.classList.add("toast-show");

    // Hide after 2 seconds
    setTimeout(() => {
        toastElement.classList.remove("toast-show");
    }, 2000);
}

function showLoginFailure() {
    let toastElement = document.getElementById("customFailToast");

    // Show toast
    toastElement.classList.add("toast-show");

    // Hide after 2 seconds
    setTimeout(() => {
        toastElement.classList.remove("toast-show");
    }, 2000);
}

// OTP Input Navigation
const inputs = document.querySelectorAll(".otp-input");

inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
        if (e.target.value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && index > 0 && !e.target.value) {
            inputs[index - 1].focus();
        }
    });
});

// Offers Alert
document.getElementById("Offers").addEventListener("click", function () {
    alert("No offers available at the moment.");
});

// OTP Modal
function showOTPSentModal(mobileNumber) {
    document.getElementById("otpMobileNumber").textContent = mobileNumber;
    $("#otpSentModal").modal("show");
}

// Admin Login Redirect
document.getElementById("admin-login").addEventListener("click", function () {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    event.preventDefault();
    sessionStorage.removeItem("isLoggedIn");
    window.location.href = "/Admin/Pages/login.html";
});
