// API Base URL
const API_BASE_URL = "http://localhost:8083";

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
        alert("✅ Login successful!");
        window.location.href = "dashboard.html"; // Redirect to admin dashboard
    })
    .catch(error => {
        console.error("❌ Login Error:", error);
        alert("❌ Invalid login credentials.");
    });
});

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
        alert(`✅ Password reset successful! Your new password: ${newPassword}`);
        $('#forgotPasswordModal').modal('hide');
    })
    .catch(error => {
        console.error("❌ Password Reset Error:", error);
        alert("❌ Failed to reset password.");
    });
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
