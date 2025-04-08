// API Base URL
const API_BASE_URL = "http://localhost:8083";

document.addEventListener("DOMContentLoaded", function () {

document.getElementById("Offers").addEventListener("click", () => alert("No offers available at the moment."));

});
// Function to validate email
function validateEmail() {
    const email = document.getElementById('username').value.trim();
    const emailError = document.getElementById('usernameError');
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
        emailError.style.display = 'block';
        emailError.textContent = 'Please enter a valid email address.';
    } else {
        emailError.style.display = 'none';
    }
    checkFormValidity();
}

// Function to validate password
function validatePassword() {
    const password = document.getElementById('password').value;
    const passwordError = document.getElementById('passwordError');
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$_])[A-Za-z\d@$_]{6,}$/;

    if (!passwordPattern.test(password)) {
        passwordError.style.display = 'block';
        passwordError.textContent = 'Password must have an uppercase letter, lowercase letter, number, and special character (@$_).';
    } else {
        passwordError.style.display = 'none';
    }
    checkFormValidity();
}

// Enable login button only if both email & password are valid
function checkFormValidity() {
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('login-button');

    loginButton.disabled = !(email && password);
}

// **Admin Login API Call**
document.getElementById('login-button').addEventListener('click', function (event) {
    event.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    let loginButton = this;

        // Change text to "Logging in..."
        loginButton.textContent = "Logging in...";
        loginButton.disabled = true; // Prevent multiple clicks

        // After 2 seconds, revert back to "Login"
        setTimeout(() => {
            loginButton.textContent = "Login";
            loginButton.disabled = false; // Re-enable the button if needed
        }, 2000);


    fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) throw new Error("Invalid email or password.");
        return response.json();
    })
    .then(data => {
        sessionStorage.setItem("adminToken", data.accessToken);
        sessionStorage.setItem("adminRole", data.role);
        showLoginSuccess();
        setTimeout(() => {
        window.location.href = "dashboard.html"; // Redirect to admin dashboard
        }, 2000);
    })
    .catch(error => {
        console.error("❌ Login Error:", error);
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

// **Forgot Password Flow**
function openForgotPasswordModal() {
    const resetEmailField = document.getElementById('resetEmail');
    resetEmailField.value = document.getElementById('username').value.trim() || "";
    $('#forgotPasswordModal').modal('show');
}

// **Generate Random Password**
function generateValidPassword() {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "@$_";
    const allChars = uppercase + lowercase + numbers + specialChars;

    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    for (let i = 4; i < 8; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split("").sort(() => 0.5 - Math.random()).join(""); // Shuffle characters
}

// **Reset Password API Call**
function sendResetPassword() {
    const resetEmail = document.getElementById('resetEmail').value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(resetEmail)) {
        alert("❌ Please enter a valid email address.");
        return;
    }

    const resetPasswordBtn = document.getElementById("resetPassword");
    resetPasswordBtn.innerHTML = "Sending new password..."

    const newPassword = generateValidPassword(); // Generate new password

    fetch(`${API_BASE_URL}/api/users/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword })
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to reset password.");
        return response.text();
    })
    .then(() => {

        setTimeout(() => {
            resetPasswordBtn.innerHTML = "Send OTP";
        }, 2000);

        console.log(`✅ Password reset successful! Your new password: ${newPassword}`);
        $('#forgotPasswordModal').modal('hide');

        showResetSuccess();

    })
    .catch(error => {
        console.error("❌ Password Reset Error:", error);
        alert("❌ Failed to reset password.");
    });
}

function showResetSuccess(){
    let toastElement = document.getElementById("resetPasswordModal");

    // Show toast
    toastElement.classList.add("toast-show");

    // Hide after 2 seconds
    setTimeout(() => {
        toastElement.classList.remove("toast-show");
    }, 2000);
}
// **Logout Function**
function adminLogout() {
    fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`
        }
    })
    .then(() => {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminRole");
        alert("✅ Logged out successfully!");
        window.location.href = "login.html";
    })
    .catch(error => console.error("❌ Logout Error:", error));
}

// Function to toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput.type === 'password') {
        // Change to text to make password visible
        passwordInput.type = 'text';
        // Change icon to eye-slash
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        // Change back to password to hide
        passwordInput.type = 'password';
        // Change icon back to eye
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}