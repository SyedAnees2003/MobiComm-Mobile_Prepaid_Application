document.addEventListener("DOMContentLoaded", function() {
    const mobileNumber = sessionStorage.getItem("mobileNumber"); // ✅ Ensure using correct key

    if (mobileNumber) {
        document.getElementById("loggedInMobile").value = mobileNumber;
        fetchUserDetails(mobileNumber);
        fetchRecentRecharge(mobileNumber);
    } else {
        // alert("❌ No user session found. Redirecting to login...");
        window.location.href = "login.html"; // Redirect if no session
    }

    setupEventListeners();

    fetchCategories();
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
    let logoutScreen = document.getElementById("logoutScreen");
    logoutScreen.style.display = "flex"; // Show logout screen

    const token = sessionStorage.getItem("userToken");
    console.log(token);
    
    if (!token) {
        // alert("❌ No active session found.");
        setTimeout(() => {
            logoutScreen.style.display = "none";
            window.location.href = "login.html";
        }, 2000); // Keep visible for 2 seconds
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
        
        // Wait for 2 seconds before redirecting
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Logout failed: " + error.message);
        setTimeout(() => {
            logoutScreen.style.display = "none";
        }, 2000);
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

        // ✅ Extract OTT benefits
        // ✅ Parse `benefits` string into an object
        let ottBenefits = [];
        try {
            const benefitsObject = JSON.parse(recharge.plan.benefits); 
            ottBenefits = benefitsObject.OTT || [];
        } catch (error) {
            console.error("❌ Error parsing benefits JSON:", error);
        }
        // ✅ Correctly extract plan details
        updatePlanDetails(
            recharge.plan.planName, 
            recharge.plan.price, 
            recharge.plan.data, 
            recharge.plan.validityDays, 
            expiryDate, 
            recharge.plan.sms, 
            recharge.plan.calls,
            ottBenefits
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

    localStorage.setItem("userMobile",newMobile);


    handleLogout();
}


    function rechargeNow(){
    // event.preventDefault();
    window.location.href='prepaidPlans.html';
}

function updatePlanDetails(planName, price, data, validity, expiry,sms, calls,ottBenefits) {
    console.log("validity : " ,validity);
    updateText("planName", planName || "Unlimited Plan");
    updateText("planPrice", `₹${price || "799"}`);
    updateText("planData", data || "3GB/day");
    updateText("planValidity", `${validity} Days` || "56 Days");
    updateText("expiryDate", expiry || "2025-02-28");
    updateText("planSMS", sms || "100");
    updateText("planCalls", calls || "Unlimited");
    document.getElementById("ottBenefitsContainer").innerHTML = getOttIcons(ottBenefits);

    console.log(planName);
}

function updateText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerText = text;
    }
}


document.addEventListener("DOMContentLoaded", function () {
    let userMobile = localStorage.getItem("userMobile"); // Retrieve user mobile from local storage/session

    if (!userMobile) {
        console.error("User mobile number not found!");
        return;
    }

    fetch(`http://localhost:8083/api/notifications/user/${userMobile}`)
        .then(response => response.json())
        .then(notifications => {
            let notificationList = document.getElementById("notificationList");
        let notificationDropdown = document.getElementById("notificationDropdown");
        let notificationBadge = document.getElementById("notificationBadge");

        notificationList.innerHTML = ""; // Clear old notifications

        if (!notifications || notifications.length === 0) {
            notificationDropdown.style.display = "none"; // Hide bell icon if no notifications
            return;
        }

        console.log(notifications);

        let unreadCount = notifications.filter(n => n.readStatus === "unread").length;

        // Show bell icon and update badge count
        notificationDropdown.style.display = "block";
        notificationBadge.textContent = unreadCount > 0 ? unreadCount : ""; // Show only if there are unread notifications


        // Sort notifications by `createdAt` (assuming it's in ISO format)
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Limit to 3 latest notifications
        const limitedNotifications = notifications.slice(0, 2);

        limitedNotifications.forEach(notification => {
            let notificationItem = document.createElement("div");
            notificationItem.classList.add("dropdown-item", "text-wrap");

            let viewButton = notification.readStatus === "unread" 
                ? `<a href="#" class="btn btn-sm btn-primary view-btn" onclick="markAsRead('${notification.notificationId}', event, this)">Mark as read</a>` 
                : `<span class="small text-muted">Read</span>`;

            notificationItem.innerHTML = `
                <p class="mb-1"><strong>${notification.notifyType}</strong></p>
                <p class="small text-muted">${notification.message}</p>
                <div class="small text-muted fw-light" style="font-size: 0.75rem;">${formatTimestamp(notification.createdAt)}</div>
                <div class="mt-2">${viewButton}</div>
                <hr class="my-2">
            `;

            notificationList.appendChild(notificationItem);
        });

        // Add "Show All" button if more than 5 notifications
        if (notifications.length >= 2) {
            let showAllItem = document.createElement("div");
            showAllItem.classList.add("text-center", "mt-2");
            showAllItem.innerHTML = `<a href="notifications.html" class="btn btn-link">Show All</a>`;
            notificationList.appendChild(showAllItem);
        }
        })
        .catch(error => console.error("Error fetching notifications:", error));
});

// OTT Image Mapping
const ottIcons = {
    "Netflix": "/Assets/Netflix.png",
    "Amazon Prime": "/Assets/AmazonPrimeVideo.png",
    "Disney+ Hotstar": "/Assets/JioHotstar.png",
    "Sony Liv": "/Assets/Sony_Liv.png"
};

// Function to Generate Dynamic OTT Icons
function getOttIcons(benefits) {
    console.log("OTT Benefits:", benefits);

    if (!benefits || !Array.isArray(benefits)) return `<p class="fw-bold mb-0 text-dark">No Benefits</p>` // Ensure benefits is an array

    let icons = benefits.map(benefit => {
        let ottName = ""; 

        // Case 1: If benefit is a string (direct OTT name)
        if (typeof benefit === "string") {
            ottName = benefit;
        } 
        // Case 2: If benefit is an object containing OTT
        else if (typeof benefit === "object" && benefit.OTT) {
            ottName = benefit.OTT;
        }

        console.log("Processed OTT:", ottName);

        const iconPath = ottIcons[ottName] || ""; // Get corresponding icon

        return iconPath ? `<img src="${iconPath}" alt="${ottName}" class="ott-icon mx-2" width="30px">` : ottName;
    }).join("");

    if(icons){
    return `
        <div class="col d-flex flex-column align-items-center">
            <div class="d-flex flex-row align-items-center ott-icons">
                ${icons}
            </div>
            <p class="text-muted small mt-1">Benefits</p>
        </div>`;
    }
    else{
        return ``;
    }
}


// Function to update notification as "Read"
async function markAsRead(notificationId, event, buttonElement) {
    event.preventDefault();

    try {
        let response = await fetch(`http://localhost:8083/api/notifications/mark-as-read/${notificationId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            // Update UI: Change button text to "Read"
            buttonElement.outerHTML = `<span class="small text-muted">Read</span>`;
        } else {
            console.error("Failed to mark notification as read");
        }
    } catch (error) {
        console.error("Error updating notification status:", error);
    }
}

function formatTimestamp(timestamp) {
    let date = new Date(timestamp);
    return date.toLocaleString(); // Adjust format as needed
}


function fetchCategories() {
    fetch("http://localhost:8083/api/categories")
        .then(response => response.json())
        .then(categories => {
            let popularId, unlimitedId, fiveGId;

            categories.forEach(category => {
                if (category.categoryName.toLowerCase() === "popular") popularId = category.categoryId;
                if (category.categoryName.toLowerCase() === "unlimited") unlimitedId = category.categoryId;
                if (category.categoryName.toLowerCase() === "5g plans") fiveGId = category.categoryId;
            });

            if (popularId) fetchPlansByCategory(popularId);
            if (unlimitedId) fetchPlansByCategory(unlimitedId);
            if (fiveGId) fetchPlansByCategory(fiveGId);
        })
        .catch(error => console.error("Error fetching categories:", error));
}

function fetchPlansByCategory(categoryId) {
    fetch(`http://localhost:8083/api/plans/${categoryId}`)
        .then(response => response.json())
        .then(plans => {
            if (plans.length > 0) {
                populatePlan(plans[0]); // Show only the first plan from each category
            }
        })
        .catch(error => console.error("Error fetching plans:", error));
}

function populatePlan(plan) {
    const container = document.getElementById("plans-container");

    let network = "4G Network";
    if (plan.planName.includes("5G")) {
        network = "5G Network";
    }
    
    const planHTML = `
        <div class="col-md-4 mb-5">
            <div class="card border shadow-sm">
                <div class="card-body" id="featuredCards">
                    <h4 class="font-weight-bold text-center mb-3">${plan.planName}</h3>
                     <p class="text-muted">${plan.data || "No Data Limit"}</p>
                    <p class="price text-primary">₹${plan.price}<small>/mo</small></p>
                    <ul class="list-unstyled">
                    <li class="mb-3"><i class="fas fa-mobile-alt mr-2"></i> ${plan.calls}</li>
                    <li class="mb-3"><i class="fas fa-rss mr-2"></i> ${plan.data || "Unlimited Data"}</li>
                    <li class="mb-3"><i class="far fa-comment-alt mr-2"></i> ${plan.sms} SMS</li>
                        <li><i class="fas fa-signal mr-2"></i> ${network}</li>
                    </ul>
                </div>
                <div class="card-footer bg-white border-0">
                    <button class="btn btn-primary btn-block" onclick="rechargeNow(${plan.planId})">View Plans <i class="fas fa-arrow-right ml-2"></i></button>
                </div>
            </div>
        </div>
    `;
    container.innerHTML += planHTML;
}

function rechargeNow(planId) {
    console.log("Selected Plan ID:", planId);
    window.location.href = `recharge.html?planId=${planId}`;
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
