document.addEventListener("DOMContentLoaded", function() {
    const mobileNumber = sessionStorage.getItem("mobileNumber"); // ✅ Ensure using correct key

    if (mobileNumber) {
        document.getElementById("loggedInMobile").value = mobileNumber;
        fetchUserDetails(mobileNumber);
        fetchRecentRecharge(mobileNumber);
    } else {
        alert("❌ No user session found. Redirecting to login...");
        window.location.href = "login.html"; // Redirect if no session
    }

    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById("nav-offers").addEventListener("click", () => alert("No offers available at the moment."));
    document.getElementById("Recharge").addEventListener("click", () => window.location.href = "prepaidPlans.html");
    document.getElementById("Explore").addEventListener("click", () => window.location.href = "prepaidPlans.html");
    document.getElementById("Help").addEventListener("click", () => window.location.href = "support.html");
    document.getElementById("Offers").addEventListener("click", () => alert("No offers available at the moment."));
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
    document.getElementById("confirmChangeBtn").addEventListener("click", changeMobileNumber);
}

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

// ✅ Handle Logout
function handleLogout() {
    // event.preventDefault();
    let logoutScreen = document.getElementById("logoutScreen");
    logoutScreen.style.display = "flex";

    const token = sessionStorage.getItem("userToken");
    console.log(token);
    if (!token) {
        alert("❌ No active session found.");
        logoutScreen.style.display = "none";
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:8083/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) return response.text().then(error => { throw new Error(error); });
        return response.text();
    })
    .then(message => {
        console.log("✅ Logout Successful:", message);
        sessionStorage.clear();
        window.location.href = "login.html";
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Logout failed: " + error.message);
        logoutScreen.style.display = "none";
    });
}

// ✅ Fetch User Details
function fetchUserDetails(mobileNumber) {
    const token = sessionStorage.getItem("userToken"); // ✅ Get stored JWT token
    console.log("fetchUser",token);

    fetch(`http://localhost:8083/api/users/${mobileNumber}`)
        .then(response => response.json())
        .then(user => {
            document.getElementById('loggedInMobile').value = user.mobileNumber;
            // document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
        })
        .catch(error => console.error("❌ Error fetching user details:", error));
}

// ✅ Fetch Recent Recharge with Authorization
function fetchRecentRecharge(mobileNumber) {
    const token = sessionStorage.getItem("userToken"); // ✅ Get stored JWT token
    console.log("fetchRecent",token);

    if (!token) {
        console.error("❌ No authentication token found.");
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    fetch(`http://localhost:8083/api/users/${mobileNumber}/recent-recharge`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(error => { throw new Error(error); });
        }
        return response.json();
    })
    .then(recharge => {
        console.log("✅ Fetched Recent Recharge:", recharge);

        if (!recharge.plan) {
            console.error("❌ Plan details missing in recent recharge.");
            alert("❌ Recharge fetched, but plan details are missing.");
            return;
        }

        const expiryDate = calculateExpiry(recharge.rechargeDate, recharge.plan.validityDays);

        // ✅ Correctly extract plan details
        updatePlanDetails(
            recharge.plan.planName, 
            recharge.amount, 
            recharge.plan.data, 
            recharge.plan.validityDays, 
            expiryDate, 
            recharge.plan.sms, 
            recharge.plan.calls
        );
    })
    .catch(error => {
        console.error("❌ Error fetching recent recharge:", error);
        alert("❌ Unable to fetch recharge details: " + error.message);
    });
}

// ✅ Function to Calculate Expiry Date
function calculateExpiry(rechargeDate, validityDays) {
    if (!rechargeDate || !validityDays) {
        console.error("❌ Invalid recharge date or validity:", rechargeDate, validityDays);
        return "N/A";
    }

    let rechargeDateObj = new Date(rechargeDate);
    if (isNaN(rechargeDateObj)) {
        console.error("❌ Invalid recharge date format:", rechargeDate);
        return "N/A";
    }

    let validity = parseInt(validityDays, 10);
    if (isNaN(validity)) {
        console.error("❌ Invalid validity format:", validityDays);
        return "N/A";
    }

    rechargeDateObj.setDate(rechargeDateObj.getDate() + validity);

    let yyyy = rechargeDateObj.getFullYear();
    let mm = String(rechargeDateObj.getMonth() + 1).padStart(2, '0');
    let dd = String(rechargeDateObj.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
}


function formatExpiryDate(rechargeDate, validityDays) {
    if (!rechargeDate || !validityDays) return "N/A";

    let expiryDate = new Date(rechargeDate);
    expiryDate.setDate(expiryDate.getDate() + validityDays);

    return expiryDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}



document.getElementById("changeMobileNumberBtn").addEventListener("click", function () {
    $("#changeMobileModal").modal("show");
});

// ✅ Handle Mobile Number Change
function changeMobileNumber() {
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
        return;
    } 

    handleLogout();
}


    function rechargeNow(){
    // event.preventDefault();
    window.location.href='prepaidPlans.html';
}

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
        navbar.style.top = "-80px";  
    } else {
        navbar.style.top = "0";
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, false);


let notificationList = document.getElementById("notificationList");

let notifications = [];
let loggedInMobile;

document.addEventListener("DOMContentLoaded", function () {
    loggedInMobile = sessionStorage.getItem("mobileNumber");
    const notificationKey = `notifications_${loggedInMobile}`;

    let notificationMenu = document.getElementById("notificationMenu");

    notifications = JSON.parse(localStorage.getItem(notificationKey)) || [];

    // Migration: Add timestamp to existing notifications if missing
    let needsUpdate = false;
    notifications = notifications.map(n => {
        if (!n.timestamp) {
            n.timestamp = new Date().toISOString();
            needsUpdate = true;
        }
        return n;
    });

    if (needsUpdate) {
        localStorage.setItem(notificationKey, JSON.stringify(notifications));
    }

    loadNotifications();

    // Toggle notification dropdown
    notificationDropdown.addEventListener("click", function (event) {
        event.preventDefault();
        notificationMenu.style.display = notificationMenu.style.display === "block" ? "none" : "block";
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!notificationDropdown.contains(event.target) && !notificationMenu.contains(event.target)) {
            notificationMenu.style.display = "none";
        }
    });

    updateBadge();
    loadUserName();
});

function updateBadge() {
    let unseenCount = notifications.filter(n => !n.seen).length;
    if (unseenCount > 0) {
        notificationBadge.textContent = unseenCount;
        notificationBadge.style.display = "inline-block";
    } else {
        notificationBadge.style.display = "none";
    }
}

function loadNotifications() {
    const sortedNotifications = notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const maxNotifications = 5;
    const limitedNotifications = sortedNotifications.slice(0, maxNotifications);

    notificationList.innerHTML = limitedNotifications.map(n => `
        <div class="notification-item ${n.seen ? 'text-muted' : ''}">
            <span>${n.text}</span>
            <div class="text-muted small">${formatTimestamp(n.timestamp)}</div>
            <a href="${n.link}" class="btn btn-sm view-btn" onclick="markAsRead('${n.id}', event)">View</a>
        </div>
    `).join('');

    if (notifications.length > maxNotifications) {
        notificationList.innerHTML += `
            <div class="text-center mt-2">
                <a href="notifications.html" class="btn btn-link">Show All</a>
            </div>
        `;
    }
}

// Helper function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

window.markAsRead = function (id, event) {
    event.preventDefault();
    let notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.seen = true;
        saveNotifications();
        updateBadge();
        loadNotifications();
    }
    window.location.href = "notifications.html";
};

function saveNotifications() {
    const notificationKey = `notifications_${loggedInMobile}`;
    localStorage.setItem(notificationKey, JSON.stringify(notifications));
}

function loadUserName() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    
    let loggedInMobile = sessionStorage.getItem("mobileNumber");
    
    let user = users.find(user => user.mobile === loggedInMobile);

    console.log(user);
    
    if (user) {
        document.getElementById("notificationDropdown").style.display = "inline-block";
    } else {
        document.getElementById("notificationDropdown").style.display = "none";
    }
}

const mainContent = document.getElementById("mainContent");
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

mainContent.onscroll = function() {
    if (mainContent.scrollTop > 400) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

function scrollToTop() {
    mainContent.scrollTop = 0;
}
