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


function validateMobileNumber() {
    const mobileInput = document.getElementById('mobile');
    const mobileNumber = mobileInput.value.trim();
    const mobileError = document.getElementById('mobileError');
    
    const regex = /^\d{10}$/;
    
    if (regex.test(mobileNumber)) {
        document.querySelectorAll('.btn-custom').forEach(btn => {
            btn.disabled = false;
        });
        mobileError.style.display = 'none';
        sessionStorage.setItem('mobileNumber', mobileNumber);
    } else {
        document.querySelectorAll('.btn-custom').forEach(btn => {
            btn.disabled = true;
        });
        mobileError.style.display = 'inline';
    }
    validateForm(); // Check if form is valid
}

function validateOTP() {
    const otpInputs = document.querySelectorAll(".otp-input");
    const otpError = document.getElementById('otpError');
    const loginButton = document.getElementById('login-button');
    let otp = '';

    otpInputs.forEach(input => otp += input.value.trim());

    const regex = /^\d{4}$/;

    if (regex.test(otp)) {
        loginButton.disabled = false;
        otpError.style.display = 'none';
    } else {
        loginButton.disabled = true;
        otpError.style.display = 'inline';
    }
    validateForm(); // Check if form is valid
}

function validateForm() {
const mobileInput = document.getElementById('mobile');
const otpInputs = document.querySelectorAll(".otp-input");
const loginButton = document.getElementById('login-button');
let otp = '';

otpInputs.forEach(input => otp += input.value.trim());

// Check if mobile number and OTP are valid
const mobileValid = /^\d{10}$/.test(mobileInput.value.trim());
const otpValid = /^\d{4}$/.test(otp);

if (mobileValid && otpValid) {
    loginButton.disabled = false;
} else {
    loginButton.disabled = true;
}
}

document.querySelectorAll(".otp-input").forEach(input => {
    input.addEventListener("input", validateOTP);

});
document.getElementById('mobile').addEventListener("input",  validateMobileNumber);
document.getElementById('login-button').addEventListener('click', function(event) {
    event.preventDefault();
    sessionStorage.setItem('isLoggedIn', 'true');
    let mobileInput = document.getElementById("mobile").value.trim();

    localStorage.setItem('userMobile',mobileInput)
    document.location.href='subscriber.html'
});

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

document.getElementById("Offers").addEventListener("click", function() {
alert("No offers available at the moment.");
});

document.querySelectorAll('.btn-custom').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.otp-input').forEach(input => {
            input.disabled = false;
        });
    });
});

function showOTPSentModal(mobileNumber) {
    document.getElementById('otpMobileNumber').textContent = mobileNumber;
    $('#otpSentModal').modal('show');
}

document.getElementById('sendOTPMobile').addEventListener('click', function() {
    const mobileNumber = document.getElementById('mobile').value.trim();
    showOTPSentModal(mobileNumber);
});

document.addEventListener("DOMContentLoaded", function () {
    let mobileInput = document.getElementById("mobile");

    // Fetch mobile number from local storage (or another source)
    let storedMobile = localStorage.getItem("userMobile");

    if (storedMobile) {
        mobileInput.value = storedMobile; // Auto-fill the input field
        validateMobileNumber(); // Call validation function if needed
    }

    // // Listen for changes (Optional: If user enters a number and we want to store it)
    // mobileInput.addEventListener("input", function () {
    //     localStorage.setItem("userMobile", mobileInput.value);
    // });
});

document.getElementById("admin-login").addEventListener("click", function() {

    // Check if the user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    // Update the profile link based on login status
    if (isLoggedIn) {
        event.preventDefault();
        sessionStorage.removeItem('isLoggedIn'); // Remove login session
        window.location.href = "/Admin/Pages/login.html";
    } 
    else {
        event.preventDefault();
        window.location.href = "/Admin/Pages/login.html";
    }
    });
