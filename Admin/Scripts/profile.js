document.addEventListener("DOMContentLoaded", loadAdminProfile);
document.getElementById("logoutBtn").addEventListener("click", adminLogout);

// ✅ Fetch Admin Profile Data from Backend
function loadAdminProfile() {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "admin-login.html";
        return;
    }

    fetch("http://localhost:8083/api/admin/profile", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to fetch admin profile.");
        return response.json();
    })
    .then(adminData => {
        console.log("Admin Profile:", adminData);

        // ✅ Populate Admin Info
        document.querySelector(".user-name").textContent = `Hi, ${adminData.firstName}`;
        document.getElementById("profileHeading").textContent = `${adminData.firstName} ${adminData.lastName}`;
        document.getElementById("mobileNumberText").textContent = adminData.mobileNumber;
        document.getElementById("emailText").textContent = adminData.email;
        const lastLoginDate = new Date(adminData.lastLogin);
        const formattedLastLogin = lastLoginDate.toLocaleString("en-IN", { 
            weekday: "short", 
            year: "numeric", 
            month: "short", 
            day: "numeric", 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit"
        });
        
        // ✅ Display formatted last login time
        document.getElementById("lastLogin").textContent = `Last Login: ${formattedLastLogin}`;
        
             // ✅ Format DOB Properly
             let dobElement = document.getElementById("dobText");
             if (dobElement) {
                 let formattedDOB = adminData.dob ? new Date(adminData.dob).toLocaleDateString() : "Not available";
                 dobElement.textContent = formattedDOB;
             }

        // ✅ Populate Address
        const address = adminData.street 
            ? `${adminData.street}, ${adminData.city}, ${adminData.state}, ${adminData.zipCode}`
            : "Not available";
        document.getElementById("addressText").textContent = address;

        // ✅ Pre-fill Input Fields
        document.getElementById("mobileNumberInput").value = adminData.mobileNumber;
        document.getElementById("emailInput").value = adminData.email;

        document.getElementById("streetInput").value = adminData.street || "";
        document.getElementById("cityInput").value = adminData.city || "";
        document.getElementById("stateInput").value = adminData.state || "";
        document.getElementById("zipInput").value = adminData.zipCode || "";

        document.getElementById("accountMobile").textContent = adminData.mobileNumber;

        let customerIdElement = document.getElementById("customerIdText");
            if (customerIdElement) {
                customerIdElement.textContent = adminData.userId || "N/A";
            }

        let ownerNameElement = document.getElementById("ownerNameText");
        if (ownerNameElement) {
            ownerNameElement.textContent = `${adminData.firstName} ${adminData.lastName}`;
        }

    })
    .catch(error => {
        console.error("❌ Error loading profile:", error);
        alert("Could not load admin profile.");
    });
}

// Toggle Edit Mode (Show Input Fields)
function toggleEditProfile() {
    document.getElementById("mobileNumberText").classList.toggle("d-none");
    document.getElementById("mobileNumberInput").classList.toggle("d-none");

    document.getElementById("emailText").classList.toggle("d-none");
    document.getElementById("emailInput").classList.toggle("d-none");

    document.getElementById("addressText").classList.toggle("d-none");
    document.getElementById("addressInput").classList.toggle("d-none");

    document.getElementById("editProfileBtn").classList.toggle("d-none");
    document.getElementById("saveProfileBtn").classList.toggle("d-none");

    // ✅ Pre-fill input fields with existing data
    document.getElementById("mobileNumberInput").value = document.getElementById("mobileNumberText").textContent.trim();
    document.getElementById("emailInput").value = document.getElementById("emailText").textContent.trim();
}

// Save Updated Admin Profile
function saveProfile() {
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "admin-login.html";
        return;
    }

    const updatedProfile = {
        mobileNumber: document.getElementById("mobileNumberInput").value.trim(),
        email: document.getElementById("emailInput").value.trim(),
        street: document.getElementById("streetInput").value.trim(),
        city: document.getElementById("cityInput").value.trim(),
        state: document.getElementById("stateInput").value.trim(),
        zipCode: document.getElementById("zipInput").value.trim()
    };

    fetch("http://localhost:8083/api/admin/profile/update", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
    })
    .then(response => {
        if (!response.ok) throw new Error("Profile update failed.");
        return response.text();
    })
    .then(() => {
        alert("Profile updated successfully!");
        loadAdminProfile();
        toggleEditProfile();
    })
    .catch(error => {
        console.error("❌ Error updating profile:", error);
        alert("❌ Could not update profile.");
    });
}

// Tab Navigation Between Profile & Account Sections
function showSection(section, link) {
    document.getElementById('profileSection').classList.add('hidden');
    document.getElementById('accountSection').classList.add('hidden');

    document.getElementById(section + 'Section').classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    link.classList.add('active');
}

function adminLogout() {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        alert("❌ You are already logged out.");
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:8083/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.text())
    .then(message => {
        console.log("✅ Logout Response:", message);
        alert("✅ Logged out successfully!");

        // ✅ Clear session storage
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminRole");

        // ✅ Redirect to login page
        window.location.href = "login.html";
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Failed to logout.");
    });
}
