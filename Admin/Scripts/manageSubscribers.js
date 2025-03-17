// ✅ Initialize DataTable AFTER data is added
function initializeDataTable() {
    if ($.fn.DataTable.isDataTable("#newUsersTable")) {
        $("#newUsersTable").DataTable().destroy(); // ✅ Destroy previous instance
    }

    $("#newUsersTable").DataTable({
        paging: true,
        pageLength: 5,
        lengthMenu: [5, 10, 20],
        searching: true,
        ordering: true,
        autoWidth: false,
        responsive: true,
        dom: '<"d-flex justify-content-between align-items-center custom-datatable-controls"fl>tip'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const token = sessionStorage.getItem("adminToken");
    
    if (!token) {
        // alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }
});
document.addEventListener("DOMContentLoaded", function () {
    fetchSubscribers();
    fetchNewSubscribers();
});

// ✅ Fetch New Subscribers (Last 7 Days)
function fetchNewSubscribers() {
    fetch("http://localhost:8083/api/users", {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`
        }
    })
    .then(response => response.json())
    .then(subscribers => {
        console.log("✅ Subscribers fetched:", subscribers);
        const newSubscribers = subscribers.filter(user => {
            let createdAt = new Date(user.createdAt);
            let oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Users registered in last 7 days
            return createdAt >= oneWeekAgo;
        });

        populateNewSubscribers(newSubscribers);

        //  initializeDataTable();   
    })
    .catch(error => console.error("❌ Error fetching subscribers:", error));
}

// ✅ Populate New Subscribers Table with Recent Recharge Details
function populateNewSubscribers(subscribers) {
    const tableBody = document.getElementById("newUsersTable").querySelector("tbody");
    tableBody.innerHTML = "";

    if (subscribers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No new subscribers found.</td></tr>`;
        initializeDataTable(); // ✅ Ensure DataTable initializes even if empty
        return;
    }

    let fetchPromises = subscribers.map(user => {
        return fetch(`http://localhost:8083/api/users/${user.mobileNumber}/recent-recharge`, {
            headers: { "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}` }
        })
        .then(response => response.ok ? response.json() : null)
        .then(recentRecharge => {
            let currentPlan = recentRecharge ? recentRecharge.plan.planName : "No Active Plan";
            let statusBadge = getStatusBadge(user.status);

            return `
                <tr>
                    <td>${statusBadge} ${user.firstName} ${user.lastName}</td>
                    <td>${user.mobileNumber}</td>
                    <td>${user.email}</td>
                    <td>${user.status}</td>
                    <td>${currentPlan}</td>
                    <td>
                        <button class="btn btn-primary btn-sm view-button" onclick="viewNewSubscriber('${user.mobileNumber}')">View</button>
                    </td>
                </tr>
            `;
        })
        .catch(error => {
            console.error(`❌ Error fetching recent recharge for ${user.mobileNumber}:`, error);
            return null;
        });
    });

    Promise.all(fetchPromises).then(rows => {
        rows = rows.filter(row => row !== null);
        tableBody.innerHTML = rows.join(""); // ✅ Append all rows at once

        initializeDataTable(); // ✅ Initialize AFTER rows are added
    });
}

// ✅ View Subscriber Details in Modal with Recent Recharge
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

// ✅ Get Status Badge for Users
function getStatusBadge(status) {
    let badgeClass = "status-dot";
    if (status.toLowerCase() === "active") {
        badgeClass += " active-dot";
    } else if (status.toLowerCase() === "inactive") {
        badgeClass += " inactive-dot";
    } else {
        badgeClass += " blocked-dot";
    }
    return `<span class="${badgeClass}"></span>`;
}

// ✅ Fetch all subscribers from the backend
function fetchSubscribers() {
    fetch("http://localhost:8083/api/users", {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`
        }
    })
    .then(response => response.json())
    .then(subscribers => {
        console.log("✅ Subscribers fetched:", subscribers);
        
        populateSubscribers(subscribers);
        updateSubscriberStats(subscribers);

        // initializeDataTable();
    })
    .catch(error => console.error("❌ Error fetching subscribers:", error));
}

// ✅ Update Subscriber Statistics in Cards

// ✅ Populate subscribers into their respective tables
function populateSubscribers(subscribers) {
    document.getElementById("activeUsersTable").innerHTML = "";
    document.getElementById("inactiveUsersTable").innerHTML = "";
    document.getElementById("blockedUsersTable").innerHTML = "";

    subscribers.forEach(user => {
        let targetTable;
        let statusBadge;
        let lastRechargeDate = "N/A"; // Default value if no recharge history

        switch (user.status.toLowerCase()) {
            case "active":
                targetTable = "activeUsersTable";
                statusBadge = '<span class="badge bg-success">Active</span>';
                break;
            case "inactive":
                targetTable = "inactiveUsersTable";
                statusBadge = '<span class="badge bg-warning">Inactive</span>';
                break;
                case "blocked":
                    targetTable = "blockedUsersTable";
                    statusBadge = '<span class="badge bg-danger">Blocked</span>';
                    break;
                    default:
                        targetTable = "inactiveUsersTable";
                statusBadge = '<span class="badge bg-secondary">Unknown</span>';
            }

            // ✅ Fetch last recharge date for the user
        fetch(`http://localhost:8083/api/users/${user.mobileNumber}/recent-recharge`, {
            headers: { "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}` }
        })
        .then(response => response.ok ? response.json() : null)
        .then(recentRecharge => {
            if (recentRecharge) {
                lastRechargeDate = new Date(recentRecharge.rechargeDate).toLocaleDateString();
            }
            
            const row = `
            <tr>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.mobileNumber}</td>
            <td>${user.email || "N/A"}</td>
            <td>
            ${lastRechargeDate}
                    <small class="text-muted">${statusBadge}</small>
                    </td>                
                    <td>
                    <button class="btn btn-primary btn-sm" onclick="viewNewSubscriber('${user.mobileNumber}')">
                        <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="openUpdateModal('${user.mobileNumber}')">
                        <i class="fas fa-edit"></i>
                        </button>
                        </td>
                        </tr>
                        `;

        document.getElementById(targetTable).innerHTML += row;
    })
    .catch(error => console.error(`❌ Error fetching recharge history for ${user.mobileNumber}:`, error));
    });
}


function updateSubscriberStats(subscribers) {
    let totalSubscribers = subscribers.length;
    let activeUsers = subscribers.filter(user => user.status.toLowerCase() === "active").length;
    let inactiveUsers = subscribers.filter(user => user.status.toLowerCase() === "inactive").length;
    let newSubscriptions = subscribers.filter(user => {
        let createdAt = new Date(user.createdAt);
        let oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Get users created in the last 7 days
        return createdAt >= oneWeekAgo;
    }).length;

    // ✅ Update HTML values dynamically
    document.getElementById("totalSubscribers").textContent = totalSubscribers;
    document.getElementById("activeUsers").textContent = activeUsers;
    document.getElementById("inactiveUsers").textContent = inactiveUsers;
    document.getElementById("newSubscriptions").textContent = newSubscriptions;
}

function openUpdateModal(mobileNumber) {
    const token = sessionStorage.getItem("adminToken");
    
    console.log("🔹 Fetching user details for:", mobileNumber);

    Promise.all([
        fetch(`http://localhost:8083/api/users/${mobileNumber}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            console.log("✅ User API Response Status:", response.status);
            return response.json();
        })
        .then(user => {
            console.log("✅ User Details Response:", user);
            return user;
        }),

        fetch(`http://localhost:8083/api/users/${mobileNumber}/recent-recharge`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => {
            console.log("✅ Recent Recharge API Response Status:", response.status);
            return response.ok ? response.json() : null;
        })
        .then(recentRecharge => {
            console.log("✅ Recent Recharge Response:", recentRecharge);
            return recentRecharge;
        })
    ])
    .then(([user, recentRecharge]) => {
        document.getElementById("updateName").value = user.firstName + " " + user.lastName;
        document.getElementById("updateMobile").value = user.mobileNumber;
        document.getElementById("updateEmail").value = user.email || "";

        // ✅ Map status_id to status name
        let userStatus = user.status;

        // ✅ Populate status dropdown
        const statusDropdown = document.getElementById("updateStatus");
        statusDropdown.innerHTML = `
            <option value="Active" ${userStatus === "Active" ? "selected" : ""}>Active</option>
            <option value="Inactive" ${userStatus === "Inactive" ? "selected" : ""}>Inactive</option>
            <option value="Blocked" ${userStatus === "Blocked" ? "selected" : ""}>Blocked</option>
        `;

        // ✅ Populate recharge details if available
        if (recentRecharge) {
            document.getElementById("updatePlan").value = recentRecharge.plan.planName;
            document.getElementById("updateLastRecharge").value = new Date(recentRecharge.rechargeDate).toLocaleDateString();
            document.getElementById("updateExpiry").value = new Date(new Date(recentRecharge.rechargeDate).getTime() + recentRecharge.plan.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString();
        } else {
            document.getElementById("updatePlan").value = "No recent recharge";
            document.getElementById("updateLastRecharge").value = "N/A";
            document.getElementById("updateExpiry").value = "N/A";
        }

        $('#updateUserModal').modal('show');
    })
    .catch(error => {
        console.error("❌ Error fetching subscriber details:", error);
    });
}

// ✅ Ensure modal is properly closed (fix any backdrop issues)
$('#updateUserModal').on('hidden.bs.modal', function () {
    $('body').css('overflow', 'auto'); 
    $('body').removeClass('modal-open'); 
    $('.modal-backdrop').remove(); 
});

  $('#detailsModal').on('hidden.bs.modal', function () {
    $('body').css('overflow', 'auto'); // Restore scrolling
    $('body').removeClass('modal-open'); // Ensure no blocking class remains
    $('.modal-backdrop').remove(); // Remove any remaining overlay
});


// ✅ Save Updated User Profile
document.getElementById("saveUserChanges").addEventListener("click", function () {
    const token = sessionStorage.getItem("adminToken");
    const mobileNumber = document.getElementById("updateMobile").value;

    let statusId;
    const statusValue = document.getElementById("updateStatus").value;

    // ✅ Convert Status Name to Status ID
    if (statusValue === "Active") {
        statusId = 1; // Active
    } else if (statusValue === "Inactive") {
        statusId = 2; // Inactive
    } else if (statusValue === "Blocked") {
        statusId = 3; // Blocked
    } else {
        alert("❌ Invalid status selected.");
        return;
    }

    const updatedUserData = {
        email: document.getElementById("updateEmail").value,
        statusId: statusId  // ✅ Send only statusId
    };

    fetch(`http://localhost:8083/api/users/${mobileNumber}/update-status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedUserData)
    })
    .then(response => {
        if (!response.ok) throw new Error("❌ Failed to update user.");
        return response.text();  // ✅ Use text to avoid JSON parsing errors
    })
    .then(message => {
        alert(`✅ ${message}`);
        $('#updateUserModal').modal('hide');
        fetchSubscribers(); // ✅ Refresh subscriber list
    })
    .catch(error => {
        console.error("❌ Error updating user:", error);
        alert("❌ Could not update user.");
    });
});



// $(document).ready(function () {
//     $('.subscriberTable').DataTable({
//         "paging": true,
//         "info": true,
//         "dom": '<"d-flex justify-content-between align-items-center custom-datatable-controls"lf>tip'
//     });
// });

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
        window.location.href = "login.html"; // ✅ Redirect to Login Page
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Logout failed: " + error.message);
        logoutScreen.style.display = "none";
    });
}
