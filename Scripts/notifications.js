document.addEventListener("DOMContentLoaded", function () {
    const loggedInMobile = sessionStorage.getItem("mobileNumber"); // Get logged-in user's mobile number
    const notificationKey = `notifications_${loggedInMobile}`; // Unique key for user-specific notifications

    // Fetch notifications from localStorage
    const notifications = JSON.parse(localStorage.getItem(notificationKey)) || [];

    // Display unread notifications
    displayUnreadNotifications(notifications);

    // Display all notifications
    displayAllNotifications(notifications);
});

// Function to display unread notifications
function displayUnreadNotifications(notifications) {
    const unreadContainer = document.getElementById("unreadNotifications");

    // Filter unread notifications
    const unreadNotifications = notifications.filter(n => !n.seen);

    if (unreadNotifications.length > 0) {
        // Display unread notifications
        unreadContainer.innerHTML = unreadNotifications.map(n => `
            <div class="notification-item mb-3 p-3 border rounded">
                <div class="fw-bold">${n.text}</div>
                <div class="text-muted small">${new Date(n.timestamp).toLocaleString()}</div>
            </div>
            <button class="btn btn-sm btn-primary mb-2" onclick="markAsRead('${n.id}')">Mark as Read</button>
            </div>
        `).join('');
    } else {
        // Display "No new notifications" message
        unreadContainer.innerHTML = `<p class="text-muted">No new notifications.</p>`;
    }
}

// Function to display all notifications
function displayAllNotifications(notifications) {
    const allContainer = document.getElementById("allNotifications");

    if (notifications.length > 0) {
        // Display all notifications
        allContainer.innerHTML = notifications.map(n => `
            <div class="notification-item mb-3 p-3 border rounded ${n.seen ? 'text-muted' : ''}">
                <div class="fw-bold">ID: ${n.id} - ${n.text}</div>
                <div class="text-muted small">${new Date(n.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    } else {
        // Display "No notifications" message
        allContainer.innerHTML = `<p class="text-muted">No notifications found.</p>`;
    }
}

// Function to mark a notification as read
window.markAsRead = function (id) {
    const loggedInMobile = sessionStorage.getItem("mobileNumber"); // Get logged-in user's mobile number
    const notificationKey = `notifications_${loggedInMobile}`; // Unique key for user-specific notifications

    // Fetch notifications from localStorage
    const notifications = JSON.parse(localStorage.getItem(notificationKey)) || [];

    // Find the notification by ID
    const notification = notifications.find(n => n.id === id);

    if (notification) {
        // Mark the notification as read
        notification.seen = true;

        // Save the updated notifications back to localStorage
        localStorage.setItem(notificationKey, JSON.stringify(notifications));

        // Refresh the UI
        displayUnreadNotifications(notifications);
        displayAllNotifications(notifications);
    }
};