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
    const regex = /^\d{10}$/;

    if (regex.test(mobileNumber)) {
        mobileError.style.display = "none";
        checkMobileInDB(mobileNumber);
    } else {
        document.querySelectorAll(".btn-custom").forEach((btn) => (btn.disabled = true));
        mobileError.style.display = "inline";
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
document.getElementById("sendOTPMobile").addEventListener("click", function () {
    const mobileNumber = document.getElementById("mobile").value.trim();
    showOTPSentModal(mobileNumber);
    document.querySelectorAll(".otp-input").forEach((input) => (input.disabled = false));
    document.getElementById("login-button").disabled = true;
});

// OTP Validation
function validateOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");
    const otpError = document.getElementById("otpError");
    let otp = "";

    otpInputs.forEach((input) => (otp += input.value.trim()));

    const regex = /^\d{4}$/;

    if (regex.test(otp)) {
        otpError.style.display = "none";
        document.getElementById("login-button").disabled = false;
    } else {
        document.getElementById("login-button").disabled = true;
        otpError.style.display = "inline";
    }
}

// Login Functionality
document.getElementById("login-button").addEventListener("click", function (event) {
    event.preventDefault();
    const mobileNumber = document.getElementById("mobile").value.trim();

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
        alert("✅ Login Successful!");
        window.location.href = "subscriber.html"; // Redirect to dashboard
        })
        .catch((error) => {
            console.error("❌ Login Failed:", error);
            alert("❌ Login failed: " + error.message);
            
        });
});

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
