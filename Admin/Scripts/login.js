// const userDatabase = {
//     "admin@gmail.com": "Admin@123",
//     "anees@gmail.com": "Anees@123"
// };

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');

        setTimeout(() => {
            passwordField.type = 'password';
            passwordIcon.classList.remove('fa-eye-slash');
            passwordIcon.classList.add('fa-eye');
        }, 2000); // 2000 milliseconds = 2 seconds
    } else {
        passwordField.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

// function validateEmail() {
//     const email = document.getElementById('username').value.trim();
//     const emailError = document.getElementById('usernameError');
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//     if (!emailPattern.test(email)) {
//         emailError.style.display = 'block';
//         emailError.textContent = 'Please enter a valid email address.';
//     }
//      else {
//         emailError.style.display = 'none';
//     }
//     checkFormValidity();
// }

// function validatePassword() {
//     const email = document.getElementById('username').value.trim();
//     const passwordError = document.getElementById('passwordError');
//     const emailError = document.getElementById('usernameError');
//     const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$_])[A-Za-z\d@$_]{6,}$/;
    
//     passwordError.style.display = 'none';
//     emailError.style.display = 'none';
    
//     // Check if email exists in the map
//     if (!(email in userDatabase)) {
//         emailError.style.display = 'block';
//         emailError.textContent = 'Username not found. Please enter a registered email.';
//         return;
//     }
    
//     const password = document.getElementById('password').value;
//     if (!passwordPattern.test(password)) {
//         passwordError.style.display = 'block';
//         passwordError.textContent = 'Password must have an uppercase letter, lowercase letter, number, and special character (@$_).';
//         return;
//     }
//     if (userDatabase[email] !== password) {
//         passwordError.style.display = 'block';
//         passwordError.textContent = 'Incorrect password. Please try again.';
//         return;
//     }

//     passwordError.style.display = 'none';
//     checkFormValidity();
// }


// function checkFormValidity() {
//     const email = document.getElementById('username').value;
//     const password = document.getElementById('password').value;
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$_])[A-Za-z\d@$_]{6,}$/;
//     const loginButton = document.getElementById('login-button');

//     loginButton.disabled = !(emailPattern.test(email) && passwordPattern.test(password));
// }

// document.getElementById('login-button').addEventListener('click', function (event) {
//     event.preventDefault();
//     const email = document.getElementById('username').value.trim();
//     sessionStorage.setItem('loggedInAdmin',email);
//     document.location.href = 'dashboard.html';
// });

// function openForgotPasswordModal() {
//     const usernameField = document.getElementById('username');
//     const resetEmailField = document.getElementById('resetEmail');
//     const enteredEmail = usernameField.value.trim();

//     if (enteredEmail) {
//         resetEmailField.value = enteredEmail;
//         resetEmailField.readOnly = true;
//     } else {
//         resetEmailField.value = '';
//         resetEmailField.readOnly = false;
//     }

//     $('#forgotPasswordModal').modal('show');
// }

// function sendResetPassword() {
//     const resetEmailField = document.getElementById('resetEmail');
//     const resetEmail = resetEmailField.value.trim();
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     const modalBody = document.querySelector('.modal-body');

//     if (!emailPattern.test(resetEmail)) {
//         alert('Please enter a valid email address.');
//         return;
//     }

//     if (!(resetEmail in userDatabase)) {
//         alert('Username not found. Please enter a registered email.');
//         return;
//     }

//     const newPassword = generateValidPassword();
//     userDatabase[resetEmail] = newPassword;

//     modalBody.innerHTML = `
//         <p class="text-success">Your password has been reset successfully.</p>
//         <p><strong>New Password:</strong> <span class="text-primary">${newPassword}</span></p>
//         <button class="btn btn-secondary mt-3" onclick="closeForgotPasswordModal()">Close</button>
//     `;
// }

// function generateValidPassword() {
//     const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     const lowercase = "abcdefghijklmnopqrstuvwxyz";
//     const numbers = "0123456789";
//     const specialChars = "@$_";
//     const allChars = uppercase + lowercase + numbers + specialChars;

//     let password = "";
//     password += uppercase[Math.floor(Math.random() * uppercase.length)];
//     password += lowercase[Math.floor(Math.random() * lowercase.length)];
//     password += numbers[Math.floor(Math.random() * numbers.length)];
//     password += specialChars[Math.floor(Math.random() * specialChars.length)];

//     for (let i = 4; i < 8; i++) {
//         password += allChars[Math.floor(Math.random() * allChars.length)];
//     }

//     return password.split("").sort(() => 0.5 - Math.random()).join(""); // Shuffle characters
// }

// function closeForgotPasswordModal() {
//     $('#forgotPasswordModal').modal('hide');
//     document.querySelector('.modal-body').innerHTML = `
//         <div>
//             <label class="form-label" for="resetEmail">Email:</label>
//             <input class="form-control" id="resetEmail" placeholder="Enter your email" type="text" />
//         </div>
//         <button class="btn btn-primary mt-3" onclick="sendResetPassword()">Reset Password</button>
//     `;
// }

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
