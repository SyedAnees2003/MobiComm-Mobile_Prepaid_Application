const adminProfiles = [
    {
        username: "admin@gmail.com",
        password: "Admin@123",
        name: "Admin",
        mobileNumber: "1234567890",
        email: "admin@gmail.com",
        address: "123 Admin Street, Admin City, Admin Country"
    },
    {
        username: "anees@gmail.com",
        password: "Anees@123",
        name: "Anees Jamal",
        mobileNumber: "7339090778",
        email: "anees@gmail.com",
        address: "456 Anees Street, Anees City, Anees Country"
    }
];

const loggedInAdmin = sessionStorage.getItem('loggedInAdmin');

// Initialize adminProfiles in local storage if not already set
if (!localStorage.getItem('adminProfiles')) {
    localStorage.setItem('adminProfiles', JSON.stringify(adminProfiles));
}

// Function to load admin profile data
function loadAdminProfile() {
    let adminData = JSON.parse(localStorage.getItem('adminProfiles')).find(admin => admin.username === loggedInAdmin);
    // If no logged-in admin, use default values
    if (!adminData) {
        adminData = {
            name: "Guest User",
            mobileNumber: "N/A",
            email: "N/A",
            address: "N/A"
        };
    }

    // Populate profile fields
    document.querySelector(".user-name").textContent = `Hi, ${adminData.name}`;
    document.getElementById("profileHeading").textContent = adminData.name;
    document.getElementById("mobileNumberText").textContent = adminData.mobileNumber;
    document.getElementById("emailText").textContent = adminData.email;
    document.getElementById("addressText").textContent = adminData.address;

    // Also update Account section
    document.getElementById("accountMobile").textContent = adminData.mobileNumber;
    document.getElementById("ownerNameText").textContent = adminData.name;
    document.getElementById("customerIdText").textContent = Math.floor(100000 + Math.random() * 900000); // Generate random Customer ID
}

function toggleEditProfile() {
    document.getElementById("mobileNumberText").classList.toggle("d-none");
    document.getElementById("mobileNumberInput").classList.toggle("d-none");

    document.getElementById("emailText").classList.toggle("d-none");
    document.getElementById("emailInput").classList.toggle("d-none");

    document.getElementById("addressText").classList.toggle("d-none");
    document.getElementById("addressInput").classList.toggle("d-none");

    // Toggle buttons
    document.getElementById("editProfileBtn").classList.toggle("d-none");
    document.getElementById("saveProfileBtn").classList.toggle("d-none");
}


// Save Updated Profile Data
function saveProfile() {
    let adminProfiles = JSON.parse(localStorage.getItem('adminProfiles'));
    let loggedInAdmin = sessionStorage.getItem('loggedInAdmin');

    let adminIndex = adminProfiles.findIndex(admin => admin.username === loggedInAdmin);
    if (adminIndex !== -1) {
        adminProfiles[adminIndex].mobileNumber = document.getElementById('mobileNumberInput').value;
        adminProfiles[adminIndex].email = document.getElementById('emailInput').value;
        adminProfiles[adminIndex].address = document.getElementById('addressInput').value;

        localStorage.setItem('adminProfiles', JSON.stringify(adminProfiles));
        loadAdminProfile();
        toggleEditProfile();
    } else {
        alert("Error updating profile.");
    }
}

// Call function when page loads
document.addEventListener("DOMContentLoaded", loadAdminProfile);

document.getElementById('logoutBtn').addEventListener("click", function(event){
    event.preventDefault();
    sessionStorage.removeItem('loggedInAdmin');
    window.location.href='login.html';
})