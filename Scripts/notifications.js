document.addEventListener("DOMContentLoaded", function () {

    const token = sessionStorage.getItem("userToken"); 
    const loggedInMobile = sessionStorage.getItem("mobileNumber"); // Get logged-in user's mobile number

    if (!token) {
        window.location.href = "login.html";
    }

    // fetch All notifications
    fetchNotifications(loggedInMobile);
});

// // Function to display unread notifications
// function displayUnreadNotifications(notifications) {
//     const unreadContainer = document.getElementById("unreadNotifications");

//     // Filter unread notifications
//     const unreadNotifications = notifications.filter(n => !n.seen);

//     if (unreadNotifications.length > 0) {
//         // Display unread notifications
//         unreadContainer.innerHTML = unreadNotifications.map(n => `
//             <div class="notification-item mb-3 p-3 border rounded">
//                 <div class="fw-bold">${n.text}</div>
//                 <div class="text-muted small">${new Date(n.timestamp).toLocaleString()}</div>
//             </div>
//             <button class="btn btn-sm btn-primary mb-2" onclick="markAsRead('${n.id}')">Mark as Read</button>
//             </div>
//         `).join('');
//     } else {
//         // Display "No new notifications" message
//         unreadContainer.innerHTML = `<p class="text-muted">No new notifications.</p>`;
//     }
// }

// // Function to display all notifications
// function displayAllNotifications(notifications) {
//     const allContainer = document.getElementById("allNotifications");

//     if (notifications.length > 0) {
//         // Display all notifications
//         allContainer.innerHTML = notifications.map(n => `
//             <div class="notification-item mb-3 p-3 border rounded ${n.seen ? 'text-muted' : ''}">
//                 <div class="fw-bold">ID: ${n.id} - ${n.text}</div>
//                 <div class="text-muted small">${new Date(n.timestamp).toLocaleString()}</div>
//             </div>
//         `).join('');
//     } else {
//         // Display "No notifications" message
//         allContainer.innerHTML = `<p class="text-muted">No notifications found.</p>`;
//     }
// }

// // Function to mark a notification as read
// window.markAsRead = function (id) {
//     const loggedInMobile = sessionStorage.getItem("mobileNumber"); // Get logged-in user's mobile number
//     const notificationKey = `notifications_${loggedInMobile}`; // Unique key for user-specific notifications

//     // Fetch notifications from localStorage
//     const notifications = JSON.parse(localStorage.getItem(notificationKey)) || [];

//     // Find the notification by ID
//     const notification = notifications.find(n => n.id === id);

//     if (notification) {
//         // Mark the notification as read
//         notification.seen = true;

//         // Save the updated notifications back to localStorage
//         localStorage.setItem(notificationKey, JSON.stringify(notifications));

//         // Refresh the UI
//         displayUnreadNotifications(notifications);
//         displayAllNotifications(notifications);
//     }
// };

// Function to fetch notifications from backend
function fetchNotifications(userMobile) {
    fetch(`http://localhost:8083/api/notifications/user/${userMobile}`)
        .then(response => response.json())
        .then(notifications => {
            console.log("Fetched Notifications:", notifications);

            // Display unread and all notifications
            displayUnreadNotifications(notifications);
            displayAllNotifications(notifications);
        })
        .catch(error => console.error("Error fetching notifications:", error));
}

// Function to display unread notifications
function displayUnreadNotifications(notifications) {
    const unreadContainer = document.getElementById("unreadNotifications");

    // Filter unread notifications
    const unreadNotifications = notifications.filter(n => !n.readStatus || n.readStatus === "unread");

    if (unreadNotifications.length > 0) {
        unreadContainer.innerHTML = unreadNotifications.map(n => `
            <div class="notification-item mb-3 p-3 border rounded">
                <div class="fw-bold">${n.message}</div>
                <div class="text-muted small">${new Date(n.createdAt).toLocaleString()}</div>
                <button class="btn btn-sm btn-primary mt-2" onclick="markAsRead('${n.notificationId}')">Mark as Read</button>
            </div>
        `).join('');
    } else {
        unreadContainer.innerHTML = `<p class="text-muted">No new notifications.</p>`;
    }
}

// Function to display all notifications
function displayAllNotifications(notifications) {
    const allContainer = document.getElementById("allNotifications");

    if (notifications.length > 0) {
        allContainer.innerHTML = notifications.map(n => `
            <div class="notification-item d-flex align-items-center p-3 border mt-2 rounded shadow-sm 
            ${n.readStatus === "read" ? 'bg-light text-muted' : 'bg-white'}"
            style="min-height: 100px; border-left: 5px solid ${n.notifyType === 'Alert' || n.notifyType === 'Error' ? '#dc3545' : '#0d6efd'};">  <!-- Blue for normal, Red for errors -->
                <div class="me-3">
                    <span class="icon-container d-flex align-items-center justify-content-center rounded-circle 
                    text-white"
                    style="width: 50px; height: 50px; font-size: 1.4rem;">
                        ${getNotificationIcon(n.notifyType)}
                    </span>
                </div>
    
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-1 fw-semibold text-${n.notifyType === 'Alert' || n.notifyType === 'Error' ? 'danger' : 'primary'}">
                            ${n.notifyType}
                        </h6>
                        <span class="small text-muted">${new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p class="mb-0">${n.message}</p>
                </div>
            </div>
        `).join('');
    } else {
        allContainer.innerHTML = `<div class="text-center text-muted p-4"><i class="bi bi-bell-slash fs-3"></i><p>No notifications found.</p></div>`;
    }        
    
}

function getNotificationIcon(type) {
    const iconMap = {
        "Recharge Success": `<i class="bi bi-check-circle-fill text-primary"></i>`,  // ✅ Green check icon
        "Offer": `<i class="bi bi-gift-fill"></i>`,  // 🎁 Gift icon
        "Reminder": `<i class="bi bi-clock-fill"></i>`,  // ⏰ Clock reminder
        "Alert": `<i class="bi bi-exclamation-triangle-fill text-danger"></i>`,  // ⚠️ Red Warning
        "Info": `<i class="bi bi-info-circle-fill text-primary"></i>`,  // ℹ️ Blue info icon
        "Error": `<i class="bi bi-x-circle-fill text-danger"></i>`,  // ❌ Red error cross
        "Support Message": `<i class="bi bi-headset text-primary"></i>`  // 🎧 Blue Support icon
    };
    return iconMap[type] || `<i class="bi bi-bell-fill text-primary"></i>`;  // Default 🔔 Blue bell
}


// Function to mark a notification as read (Updates backend)
window.markAsRead = function (id) {
    console.log(id);
    fetch(`http://localhost:8083/api/notifications/mark-as-read/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to mark notification as read");
        return response.json();
    })
    .then(updatedNotification => {
        console.log("Notification Marked as Read:", updatedNotification);

        // Refresh notifications after marking as read
        fetchNotifications(sessionStorage.getItem("mobileNumber"));
    })
    .catch(error => console.error("Error updating notification:", error));
};


// ✅ Handle Logout
function handleLogout() {
    let logoutScreen = document.getElementById("logoutScreen");
    logoutScreen.style.display = "flex"; // Show logout screen

    const token = sessionStorage.getItem("userToken");
    console.log(token);
    
    if (!token) {
        alert("❌ No active session found.");
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
