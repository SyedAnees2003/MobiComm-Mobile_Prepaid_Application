document.addEventListener("DOMContentLoaded", function() {
    const mobileNumber = sessionStorage.getItem('mobileNumber');
    if (mobileNumber) {
        document.getElementById('loggedInMobile').value = mobileNumber;
    }
    loadActivePlan();
});
document.getElementById("nav-offers").addEventListener("click", function() {
    // event.preventDefault();
    alert("No offers available at the moment.");
});

document.getElementById("Recharge").addEventListener("click", function() {
    window.location.href = "prepaidPlans.html";
});

document.getElementById("Explore").addEventListener("click", function() {
    window.location.href = "prepaidPlans.html";
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

document.getElementById('logoutBtn').addEventListener('click', function() {
    let logoutScreen = document.getElementById('logoutScreen');

    logoutScreen.style.display = 'flex';

    setTimeout(function() {
        sessionStorage.removeItem('isLoggedIn');
        logoutScreen.style.display = "none";
        window.location.href = "login.html";
    },1500);

});

document.getElementById("changeMobileNumberBtn").addEventListener("click", function () {
    $("#changeMobileModal").modal("show");
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
        return;
    } 
    else {
        let logoutScreen = document.getElementById('logoutScreen');

        // Show the loading screen
        logoutScreen.style.display = 'flex';

        setTimeout(function() {
            sessionStorage.clear();
            sessionStorage.setItem("mobileNumber", newMobile);
            sessionStorage.removeItem('isLoggedIn');
            localStorage.setItem("userMobile", newMobile);
            logoutScreen.style.display = "none";
            window.location.href = "login.html";
        },1500);
    }
});

    function rechargeNow(){
    // event.preventDefault();
    window.location.href='prepaidPlans.html';
}


// Function to Load Active Plan Data from Local Storage
function loadActivePlan() {
    let userMobile = sessionStorage.getItem('mobileNumber') || "9876543210";
    let rechargeHistory = JSON.parse(localStorage.getItem("rechargeHistory")) || [];

    let lastTransaction = rechargeHistory.reverse().find(txn => txn.mobile === userMobile);

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
        return "N/A";
    }

    let rechargeDateObj = new Date(rechargeDate);
    if (isNaN(rechargeDateObj)) {
        console.error("Invalid recharge date format:", rechargeDate);
        return "N/A";
    }
    let validityDays = parseInt(validity.replace(/\D/g, ""), 10);
    
    if (isNaN(validityDays)) {
        console.error("Invalid validity format:", validity);
        return "N/A";
    }
    rechargeDateObj.setDate(rechargeDateObj.getDate() + validityDays);

    let yyyy = rechargeDateObj.getFullYear();
    let mm = String(rechargeDateObj.getMonth() + 1).padStart(2, '0');
    let dd = String(rechargeDateObj.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
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
