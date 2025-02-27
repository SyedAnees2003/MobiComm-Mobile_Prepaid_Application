document.addEventListener("DOMContentLoaded", function() {
    const mobileNumber = sessionStorage.getItem('mobileNumber'); // Retrieve mobile number
    if (mobileNumber) {
        document.getElementById('loggedInMobile').value = mobileNumber; // Set it as the input field value
    }
    loadActivePlan();
});
document.getElementById("nav-offers").addEventListener("click", function() {
    // event.preventDefault();
    alert("No offers available at the moment.");
});

document.getElementById("Recharge").addEventListener("click", function() {
    window.location.href = "prepaidPlans.html";  // Change this to your login page URL
});

document.getElementById("Explore").addEventListener("click", function() {
    window.location.href = "prepaidPlans.html";  // Change this to your plans page URL
});

document.getElementById("Help").addEventListener("click", function() {
    window.location.href="support.html"
});

document.getElementById("Offers").addEventListener("click", function() {
    alert("No offers available at the moment.");
});

document.addEventListener("DOMContentLoaded", function() {
        const sidebar = document.getElementById("sidebar");
        const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
        const toggleIcon = toggleSidebarBtn.querySelector("i");

        toggleSidebarBtn.addEventListener("click", function() {
            sidebar.classList.toggle("hidden");
            if (sidebar.classList.contains("hidden")) {
                toggleIcon.classList.remove("fa-chevron-left");
                toggleIcon.classList.add("fa-chevron-right");
            } else {
                toggleIcon.classList.remove("fa-chevron-right");
                toggleIcon.classList.add("fa-chevron-left");
            }
        });
});

document.getElementById("changeMobileNumberBtn").addEventListener("click", function () {
    $("#changeMobileModal").modal("show"); // Show Bootstrap modal
});

document.getElementById("confirmChangeBtn").addEventListener("click", function () {
    const currentMobile = sessionStorage.getItem("mobileNumber");
    const newMobile = document.getElementById("newMobileNumber").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    if (!newMobile) {
        errorMessage.textContent = "Please enter a mobile number.";
        errorMessage.style.display = "block";
        return;
    }

    if (newMobile === currentMobile) {
        errorMessage.textContent = "Already logged in with this number.";
        errorMessage.style.display = "block";
        return; // Stop execution
    } 
    else {
        let logoutScreen = document.getElementById('logoutScreen');

        // Show the loading screen
        logoutScreen.style.display = 'flex';

        setTimeout(function() {
            sessionStorage.clear(); // Clears all session data
            sessionStorage.setItem("mobileNumber", newMobile);
            sessionStorage.removeItem('isLoggedIn'); // Remove login session
            localStorage.setItem("userMobile", newMobile);
            logoutScreen.style.display = "none"; // Hide after 2 seconds
            window.location.href = "login.html"; // Redirect to login page
        },1500);
    }
});

    function rechargeNow(){
    // event.preventDefault();
    window.location.href='prepaidPlans.html';
}


// Function to Load Active Plan Data from Local Storage
function loadActivePlan() {
    let userMobile = sessionStorage.getItem('mobileNumber') || "9876543210"; // Default fallback
    let rechargeHistory = JSON.parse(localStorage.getItem("rechargeHistory")) || [];

    // Find last transaction for the user
    let lastTransaction = rechargeHistory.reverse().find(txn => txn.mobile === userMobile);
    // console.log("Mobile: " + lastTransaction.mobile);

    if (lastTransaction) {
        let expiry = calculateExpiry(lastTransaction.date, localStorage.getItem('planValidity'));
        console.log(expiry);
        updatePlanDetails(lastTransaction.category, lastTransaction.price, lastTransaction.data, localStorage.getItem('planValidity'),expiry,lastTransaction.sms, lastTransaction.calls);
        // console.log(lastTransaction.data);
    }
}

function calculateExpiry(rechargeDate, validity) {
    if (!rechargeDate || !validity) {
        console.error("Invalid recharge date or validity:", rechargeDate, validity);
        return "N/A"; // Return "N/A" if validity is missing
    }

    let rechargeDateObj = new Date(rechargeDate);
    if (isNaN(rechargeDateObj)) {
        console.error("Invalid recharge date format:", rechargeDate);
        return "N/A"; // Handle invalid date format
    }
    // Extract numeric value from validity (e.g., "28 Days" -> 28)
    let validityDays = parseInt(validity.replace(/\D/g, ""), 10);
    
    if (isNaN(validityDays)) {
        console.error("Invalid validity format:", validity);
        return "N/A"; // Return "N/A" if validity is incorrect
    }
    rechargeDateObj.setDate(rechargeDateObj.getDate() + validityDays);

    // Format as YYYY-MM-DD
    let yyyy = rechargeDateObj.getFullYear();
    let mm = String(rechargeDateObj.getMonth() + 1).padStart(2, '0');
    let dd = String(rechargeDateObj.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}

// Function to Update Plan Details Dynamically
function updatePlanDetails(planName, price, data, validity, expiry,sms, calls) {
    console.log("validity : " ,validity);
    updateText("planName", planName || "Unlimited Plan");
    updateText("planPrice", `${price || "799"}`);
    updateText("planData", data || "3GB/day");
    updateText("planValidity", validity || "56 Days");
    updateText("expiryDate", expiry || "2025-02-28");
    updateText("planSMS", sms || "100");
    updateText("planCalls", calls || "Unlimited");
    console.log(planName);
}

// Helper Function to Update Text Content
function updateText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerText = text;
    }
}


let lastScrollTop = 0;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 50) {
        // If scrolling down & not at the top, hide navbar
        navbar.style.top = "-80px";  
    } else {
        // If scrolling up, show navbar
        navbar.style.top = "0";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;  // Prevent negative values
}, false);

