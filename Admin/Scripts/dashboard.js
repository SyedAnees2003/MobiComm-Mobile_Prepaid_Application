document.addEventListener('DOMContentLoaded', function () {

    // Global variables for chart instances
    let transactionChart, userStatusChart, userCountChart,totalRevenueChart;

    function createCharts() {
        // Destroy existing chart instances if they exist
        if (totalRevenueChart) totalRevenueChart.destroy();

        // Total Revenue Per Month Bar Chart
        const revenueCtx = document.getElementById('totalRevenueChart').getContext('2d');
        totalRevenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Total Revenue (₹)',
                    data: [50000, 60000, 75000, 82000, 100000, 90000],
                    backgroundColor: 'rgba(99, 151, 255, 0.7)',
                    borderColor: 'rgb(71, 125, 251)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Call the function to create charts
    createCharts();

    // Resize Charts on Window Resize
    window.addEventListener("resize", function () {
        createCharts(); // Destroy and recreate charts on resize
    });
});

document.addEventListener("DOMContentLoaded", function () {
    fetchAndRenderCharts();
});

// ✅ Fetch Data for All Charts
function fetchAndRenderCharts() {
    const token = sessionStorage.getItem("adminToken");

    Promise.all([
        fetch("http://localhost:8083/api/users", {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(response => response.json()),

        fetch("http://localhost:8083/api/recharge-history", {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(response => response.json())
    ])
    .then(([users, rechargeHistory]) => {
        processUserStatusData(users);
        processNewSubscribersData(users);
        processDailyTransactionsData(rechargeHistory);
    })
    .catch(error => console.error("❌ Error fetching analytics data:", error));
}

// ✅ Process & Render User Status Chart
function processUserStatusData(users) {
    let statusCount = { Active: 0, Inactive: 0, Blocked: 0 };

    users.forEach(user => {
        // console.log("Active: ",user.status);
        if (user.status === "active") {
            statusCount.Active++;
        } else if (user.status === "inactive") {
            statusCount.Inactive++;
        } else if (user.status === "Blocked") {
            statusCount.Blocked++;
        }
    });

    renderUserStatusChart(statusCount);
    console.log(statusCount);
}

// ✅ Render User Status Chart
function renderUserStatusChart(data) {
    new Chart(document.getElementById("userStatusChart"), {
        type: "pie",
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ["#007bff", "#ffc107", "#dc3545"]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ✅ Process & Render New Subscribers Chart (Based on Created Date)
function processNewSubscribersData(users) {
    let subscribersPerDay = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };

    users.forEach(user => {
        let createdAt = new Date(user.createdAt);
        let day = createdAt.toLocaleString("default", { weekday: "long" }); // E.g., "Monday", "Tuesday"

        subscribersPerDay[day] = (subscribersPerDay[day] || 0) + 1;
    });

    renderUserCountChart(subscribersPerDay);
}


// ✅ Render New Subscribers Chart
function renderUserCountChart(data) {
    new Chart(document.getElementById("userCountChart"), {
        type: "bar",
        data: {
            labels: Object.keys(data), // Days of the week
            datasets: [{
                label: "New Subscribers",
                data: Object.values(data),
                backgroundColor: [
                    "#007bff", "#28a745", "#ffc107", "#dc3545",
                    "#007bff", "#28a745", "#ffc107"
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ✅ Process & Render Daily Transactions Chart
function processDailyTransactionsData(rechargeHistory) {
    let transactionsPerDay = {};

    rechargeHistory.forEach(recharge => {
        let date = new Date(recharge.rechargeDate).toLocaleDateString(); // Format: "MM/DD/YYYY"
        
        transactionsPerDay[date] = (transactionsPerDay[date] || 0) + 1;
    });

    renderTransactionChart(transactionsPerDay);
}

// ✅ Render Daily Transactions Chart
function renderTransactionChart(data) {
    new Chart(document.getElementById("transactionChart"), {
        type: "line",
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: "Daily Transactions",
                data: Object.values(data),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgb(46, 186, 221)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    fetchExpiringSubscriptions();
    fetchDashboardData();
});

// ✅ Fetch Subscribers, Plans, and Expiring Users Count
function fetchDashboardData() {
    const token = sessionStorage.getItem("adminToken");

    Promise.all([
        fetch("http://localhost:8083/api/users", {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(response => response.json()),
        fetch("http://localhost:8083/api/plans", {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(response => response.json())
    ])
    .then(([users, plans]) => {
        console.log("✅ Users:", users);
        console.log("✅ Plans:", plans);

        // ✅ Total Subscribers
        const totalSubscribers = users.length;
        document.getElementById("totalSubscribers").textContent = totalSubscribers;

        // ✅ Active Users (Based on Status)
        const activeUsers = users.filter(user => user.status.toLowerCase() === "active").length;
        document.getElementById("activeUsers").textContent = `${activeUsers}+`;

        // ✅ Fetch Expiring Users
        getExpiringUsersCount(users, token);

        // ✅ Total Plans Available
        document.getElementById("totalPlans").textContent = plans.length;
    })
    .catch(error => console.error("❌ Error fetching dashboard data:", error));
}

// ✅ Fetch Expiring Users (Users with plans expiring within 7 days)
function getExpiringUsersCount(users, token) {
    Promise.all(users.map(user => 
        fetch(`http://localhost:8083/api/users/${user.mobileNumber}/recent-recharge`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.ok ? response.json() : null)
    ))
    .then(recharges => {
        const expiringUsers = recharges.filter(recharge => 
            recharge && isExpiringWithinAWeek(recharge.rechargeDate, recharge.plan.validityDays)
        ).length;

        document.getElementById("expiringUsers").textContent = expiringUsers;
    })
    .catch(error => console.error("❌ Error fetching expiring users:", error));
}

// ✅ Check if plan expires within a week
function isExpiringWithinAWeek(rechargeDate, validityDays) {
    const rechargeDateObj = new Date(rechargeDate);
    const expiryDate = new Date(rechargeDateObj.setDate(rechargeDateObj.getDate() + validityDays));
    const today = new Date();
    const weekFromNow = new Date(today.setDate(today.getDate() + 7));

    return expiryDate <= weekFromNow && expiryDate >= new Date();
}

// ✅ Fetch All Users and Check for Expiring Plans
function fetchExpiringSubscriptions() {
    const token = sessionStorage.getItem("adminToken");

    fetch("http://localhost:8083/api/users", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(users => {
        console.log("✅ Users fetched:", users);
        let expiringUsers = [];

        // ✅ Fetch each user's recent recharge
        let fetchPromises = users.map(user =>
            fetch(`http://localhost:8083/api/users/${user.mobileNumber}/recent-recharge`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(response => response.ok ? response.json() : null)
            .then(recentRecharge => {
                if (recentRecharge) {
                    let expiryDate = calculateExpiryDate(recentRecharge.rechargeDate, recentRecharge.plan.validityDays);
                    let daysLeft = getDaysUntilExpiry(expiryDate);
                    
                    // ✅ Add to expiringUsers if the plan expires in 7 days
                    if (daysLeft <= 7) {
                        expiringUsers.push({
                            name: `${user.firstName} ${user.lastName}`,
                            mobileNumber: user.mobileNumber,
                            planName: recentRecharge.plan.planName,
                            expiryDate: expiryDate,
                            recharge: recentRecharge
                        });
                    }
                }
            })
            .catch(error => console.error(`❌ Error fetching recharge for ${user.mobileNumber}:`, error))
        );

        // ✅ Wait for all fetches to complete
        Promise.all(fetchPromises).then(() => populateExpiringSubscriptions(expiringUsers));
    })
    .catch(error => console.error("❌ Error fetching users:", error));
}

// ✅ Populate Expiring Subscriptions Table
function populateExpiringSubscriptions(subscribers) {
    const tableBody = document.querySelector("#exampleTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    if (subscribers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No subscriptions expiring within 7 days.</td></tr>`;
        return;
    }

    subscribers.forEach(user => {
        const formattedExpiry = new Date(user.expiryDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const row = `
            <tr>
                <td>${user.name}</td>
                <td>${user.mobileNumber}</td>
                <td>${user.planName}</td>
                <td>${formattedExpiry}</td>
                <td><button class="btn btn-primary view-button" onclick="viewNewSubscriber('${user.mobileNumber}')">View</button></td>
                <td><button class="btn btn-warning notify-button" onclick="showSnackbar('${user.mobileNumber}', 'Notification has been sent!')">Notify</button></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function viewNewSubscriber(mobileNumber) {
    const token = sessionStorage.getItem("adminToken");

    Promise.all([
        fetch(`http://localhost:8083/api/users/${mobileNumber}`, {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(response => response.json()),
        fetch(`http://localhost:8083/api/users/${mobileNumber}/recent-recharge`, {
            headers: { "Authorization": `Bearer ${token}` }
        }).then(response => response.ok ? response.json() : null)
    ])
    .then(([user, recentRecharge]) => {
        // ✅ Populate User Details
        document.getElementById("subscriberName").textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById("subscriberMobile").textContent = user.mobileNumber;
        document.getElementById("subscriberEmail").textContent = user.email || "N/A";

        // ✅ Format Address
        let address = user.street ? `${user.street}, ${user.city}, ${user.state}, ${user.zipCode}` : "Not Available";
        document.getElementById("subscriberAddress").textContent = address;

        let currentPlan = "No Active Plan";
        let planExpiry = "N/A";
        let rechargeHistoryContent = "<p>No recharge history available.</p>";

        if (recentRecharge) {
            currentPlan = recentRecharge.plan.planName;
            planExpiry = formatExpiryDate(recentRecharge.rechargeDate, recentRecharge.plan.validityDays);
            rechargeHistoryContent = `
                <div class="transaction-card">
                    <p><strong>Recharge Date:</strong> ${formatDate(recentRecharge.rechargeDate)}</p>
                    <p><strong>Amount:</strong> ₹${recentRecharge.amount}</p>
                    <p><strong>Status:</strong> ${recentRecharge.status}</p>
                    <p><strong>Plan:</strong> ${recentRecharge.plan.planName || "N/A"}</p>
                    <p><strong>Mode of Payment:</strong> ${recentRecharge.rechargeMode}</p>
                    <hr />
                </div>
            `;
        }

        document.getElementById("subscriberPlan").textContent = currentPlan;
        document.getElementById("subscriberExpiry").textContent = planExpiry;
        document.getElementById("rechargeHistory").innerHTML = rechargeHistoryContent;

        // ✅ Show the modal
        const subscriberModal = new bootstrap.Modal(document.getElementById("subscriberModal"));
        subscriberModal.show();
    })
    .catch(error => console.error("❌ Error fetching subscriber details:", error));
}


// ✅ Format Date Function
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// ✅ Calculate Expiry Date
function formatExpiryDate(rechargeDate, validityDays) {
    const expiryDate = new Date(rechargeDate);
    expiryDate.setDate(expiryDate.getDate() + validityDays);
    return expiryDate.toLocaleDateString();
}

// ✅ Calculate Expiry Date
function calculateExpiryDate(rechargeDate, validityDays) {
    let expiryDate = new Date(rechargeDate);
    expiryDate.setDate(expiryDate.getDate() + validityDays);
    return expiryDate;
}

// ✅ Get Days Until Expiry
function getDaysUntilExpiry(expiryDate) {
    let today = new Date();
    let timeDiff = expiryDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// ✅ Notify User (Placeholder Function)
function notifyUser(mobileNumber) {
    alert(`🔔 Notification sent to ${mobileNumber}!`);
}


// Set global chart settings
Chart.defaults.maintainAspectRatio = false;


// ✅ Check if Report Already Exists
function checkExistingReport(reportType) {
    return fetch("http://localhost:8083/api/analytics/reports", {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`
        }
    })
    .then(response => {
        if (!response.ok) {
            console.error("❌ API Error:", response.status);
            return []; // ✅ Return empty array if API fails
        }
        return response.json();
    })
    .then(reports => {
        console.log("📊 Existing Reports:", reports);
        return reports.find(report => report.reportType === reportType) || null;
    })
    .catch(error => {
        console.error("❌ Error checking existing reports:", error);
        return null; // ✅ Prevents JS errors if request fails
    });
}


// ✅ Save or Update Report in DB
function saveReportInDB(reportType, reportData) {
    const token = sessionStorage.getItem("adminToken");

    checkExistingReport(reportType).then(exists => {
        if (exists) {
            console.log(`🚨 Report "${reportType}" already exists. Updating it.`);
        } else {
            console.log(`📤 Saving new report: ${reportType}`);
        }

        const reportPayload = {
            reportType: reportType,
            reportData: reportData
        };

        fetch("http://localhost:8083/api/analytics/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(reportPayload)
        })
        .then(response => response.json())
        .then(data => console.log("✅ Report saved/updated:", data))
        .catch(error => console.error("❌ Error saving report:", error));
    });
}



// ✅ Function to Generate & Store Report
function generateReport(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return console.error(`Canvas with ID '${chartId}' not found.`);

    const chartInstance = Chart.getChart(chartId);
    if (!chartInstance) return console.error(`Chart instance for '${chartId}' not found.`);

    const chartTitleElem = canvas.closest('.chart-item').querySelector('h4');
    const chartTitle = chartTitleElem ? chartTitleElem.textContent.trim() : 'Unknown Chart';

    // ✅ Extract Labels and Data
    const labels = chartInstance.data.labels;
    const dataset = chartInstance.data.datasets[0];
    const data = dataset.data;
    const yAxisLabel = dataset.label || "Data Values";

    let xAxisLabel = "Categories";
    if (chartId === "transactionChart") xAxisLabel = "Days";
    else if (chartId === "userStatusChart") xAxisLabel = "User Status";
    else if (chartId === "userCountChart") xAxisLabel = "Week Days";
    else if (chartId === "totalRevenueChart") xAxisLabel = "Months";

    // ✅ Format Report Data
    let reportData = labels.map((label, index) => ({
        [xAxisLabel]: label,
        [yAxisLabel]: data[index]
    }));

    // ✅ Save Report in Database
    saveReportInDB(chartTitle, reportData);

    // ✅ Download CSV Report
    let reportContent = `Report Title: ${chartTitle}\n\nX-Axis (${xAxisLabel}), Y-Axis (${yAxisLabel})\n`;
    labels.forEach((label, index) => {
        reportContent += `"${label}", "${data[index]}"\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${chartTitle.replace(/\s+/g, '_')}_report.csv`;
    downloadLink.click();
}


document.addEventListener('DOMContentLoaded', function () {

    const token = sessionStorage.getItem("adminToken");

    if(!token){
        // alert("No session available!");
        window.location.href="login.html";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners to all Notify buttons
    const notifyButtons = document.querySelectorAll(".notify-button");
    notifyButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Get the table row containing the clicked button
            const row = button.closest("tr");

            // Extract the mobile number and plan expiry date from the row
            const mobileNumber = row.querySelector("td:nth-child(2)").textContent.trim();
            const planExpiry = row.querySelector("td:nth-child(3)").textContent.trim();

            // Calculate days left until plan expiry
            const daysLeft = calculateDaysLeft(planExpiry);

            // Compose the notification message
            const notificationMessage = `Recharge is expiring soon (${daysLeft} days left)`;

            // Add the notification to the user's notifications
            addNotificationToUser(mobileNumber, notificationMessage);

            // Show a confirmation snackbar
            showSnackbar("Notification sent successfully!");
        });
    });
});

// Function to add a notification to the user's notifications
function addNotificationToUser(mobileNumber, message) {
    // Find the user in the users array
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.mobile === mobileNumber);

    if (user) {
        // Create a new notification
        const newNotification = {
            id: `N${Date.now()}`, // Generate a unique ID
            text: message,
            seen: false,
            link: "notifications.html",
            timestamp: new Date().toISOString() // Add timestamp
        };

        // Add the notification to the user's notifications
        const notificationKey = `notifications_${user.mobile}`; // Unique key for user-specific notifications
        const notifications = JSON.parse(localStorage.getItem(notificationKey)) || [];
        notifications.push(newNotification);

        // Save the updated notifications back to localStorage
        localStorage.setItem(notificationKey, JSON.stringify(notifications));
        console.log(notifications);
    } else {
        console.error("User not found.");
    }
}

// Function to show a snackbar
function showSnackbar(mobileNumber, message) {
    const snackbar = document.createElement("div");
    snackbar.className = "snackbar";
    snackbar.textContent = message;
    document.body.appendChild(snackbar);

    // Show the snackbar
    snackbar.classList.add("show");

    // Hide the snackbar after 3 seconds
    setTimeout(() => {
        snackbar.classList.remove("show");
        snackbar.remove();
    }, 3000);
}

// ✅ Admin Logout Function (With API Integration)
function logout() {
    event.preventDefault(); // Prevent default link behavior
    console.log("🔹 Logging out...");

    let logoutScreen = document.getElementById("logoutScreen");
    logoutScreen.style.display = "flex"; // Show loading screen

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        alert("❌ No active session found.");
        logoutScreen.style.display = "none";
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:8083/auth/logout", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(error => { throw new Error(error); });
        }
        return response.text();
    })
    .then(message => {
        console.log("✅ Logout Successful:", message);
        sessionStorage.removeItem("adminToken"); // ✅ Remove Token
        sessionStorage.removeItem("adminRole");  // ✅ Remove Role
        logoutScreen.style.display = "none";
        alert("✅ Successfully logged out!");
        window.location.href = "login.html"; // ✅ Redirect to Login Page
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Logout failed: " + error.message);
        logoutScreen.style.display = "none";
    });
}
