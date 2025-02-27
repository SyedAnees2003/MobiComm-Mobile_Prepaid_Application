$(document).ready(function () {
    $('#newUsersTable').DataTable({
        "paging": true,
        "info": true,
        "dom": '<"d-flex justify-content-between align-items-center custom-datatable-controls"lf>tip'
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const viewButtons = document.querySelectorAll('.view-button');

    viewButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const row = this.closest('tr');
            const name = row.cells[0].textContent.trim();
            const status = row.cells[1].textContent.trim();
            const currentPlan = row.cells[2].textContent.trim();
            const mobile = 'N/A'; // Placeholder as the mobile number isn't available in the table
            const expiry = '2025-12-31'; // Placeholder expiry date

            document.getElementById('subscriberName').textContent = name;
            document.getElementById('subscriberMobile').textContent = mobile;
            document.getElementById('subscriberExpiry').textContent = expiry;

            // Add status and current plan to modal dynamically
            const modalBody = document.querySelector('#subscriberModal .modal-body');
            const existingStatus = document.getElementById('subscriberStatus');
            const existingPlan = document.getElementById('subscriberPlan');

            if (existingStatus) {
                existingStatus.textContent = status;
            } else {
                const statusElement = document.createElement('p');
                statusElement.innerHTML = `<strong>Status:</strong> <span id="subscriberStatus">${status}</span>`;
                modalBody.insertBefore(statusElement, modalBody.children[3]);
            }

            if (existingPlan) {
                existingPlan.textContent = currentPlan;
            } else {
                const planElement = document.createElement('p');
                planElement.innerHTML = `<strong>Current Plan:</strong> <span id="subscriberPlan">${currentPlan}</span>`;
                modalBody.insertBefore(planElement, modalBody.children[4]);
            }

            const expiryDate = new Date(expiry.split('/').reverse().join('-'));
                    const firstRechargeDate = new Date(expiryDate);
                    firstRechargeDate.setMonth(expiryDate.getMonth() - 1); // Set date to one month before expiry

            // Sample recharge history data
            const rechargeHistory = [
                {
                    date: firstRechargeDate.toISOString().split('T')[0],
                    amount: '$20',
                    status: 'Successful',
                    plan: currentPlan,
                    mode: 'UPI'
                }
            ];

            const rechargeHistoryContainer = document.getElementById('rechargeHistory');
            rechargeHistoryContainer.innerHTML = '';
            rechargeHistory.forEach(history => {
                const historyDiv = document.createElement('div');
                historyDiv.classList.add('transaction-card');
                historyDiv.innerHTML = `
                    <p><strong>Recharge Date:</strong> ${history.date}</p>
                    <p><strong>Amount:</strong> ${history.amount}</p>
                    <p><strong>Status:</strong> ${history.status}</p>
                    <p><strong>Plan:</strong> ${history.plan}</p>
                    <p><strong>Mode of Payment:</strong> ${history.mode}</p>
                    <hr />
                `;

                rechargeHistoryContainer.appendChild(historyDiv);
            });

            const subscriberModal = new bootstrap.Modal(document.getElementById('subscriberModal'));
            subscriberModal.show();
        });
    });
});


// Sample User Data
const users = [
    { name: "John Doe", mobile: "9876543210", email: "john@example.com", status: "active", plan: "Popular", lastRecharge: "2025-01-20", expiry: "2025-03-20" },
    { name: "Alice Brown", mobile: "9123456780", email: "alice@example.com", status: "active", plan: "Unlimited", lastRecharge: "2025-02-15", expiry: "2025-04-15" },
    { name: "David Smith", mobile: "9988776655", email: "david@example.com", status: "active", plan: "Data", lastRecharge: "2025-02-10", expiry: "2025-04-10" },
    { name: "Emily White", mobile: "9112233445", email: "emily@example.com", status: "active", plan: "Top-up", lastRecharge: "2025-01-30", expiry: "2025-03-30" },

    { name: "Michael Lee", mobile: "9223344556", email: "michael@example.com", status: "inactive", plan: "Calls", lastRecharge: "2024-12-25", expiry: "2025-02-25" },
    { name: "Sophia Green", mobile: "9334455667", email: "sophia@example.com", status: "inactive", plan: "Unlimited", lastRecharge: "2025-01-05", expiry: "2025-03-05" },
    { name: "Daniel Black", mobile: "9445566778", email: "daniel@example.com", status: "inactive", plan: "International Roaming", lastRecharge: "2024-11-15", expiry: "2025-01-15" },
    { name: "Emma Watson", mobile: "9556677889", email: "emma@example.com", status: "inactive", plan: "Popular", lastRecharge: "2025-02-01", expiry: "2025-04-01" },

    { name: "Tom Wilson", mobile: "9667788990", email: "tom@example.com", status: "blocked", plan: "Data", lastRecharge: "2024-10-10", expiry: "2024-12-10" },
    { name: "Olivia Jones", mobile: "9778899001", email: "olivia@example.com", status: "blocked", plan: "Top-up", lastRecharge: "2024-11-20", expiry: "2025-01-20" },
    { name: "William Brown", mobile: "9889900123", email: "william@example.com", status: "blocked", plan: "Calls", lastRecharge: "2024-12-01", expiry: "2025-02-01" },
    { name: "Charlotte Davis", mobile: "9990011223", email: "charlotte@example.com", status: "blocked", plan: "Unlimited", lastRecharge: "2024-10-30", expiry: "2024-12-30" }
];

// Function to populate tables
function populateTable(status, tableId) {
    const filteredUsers = users.filter(user => user.status === status);
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = ""; // Clear previous data
    
    filteredUsers.forEach(user => {

        // Set plan to "None" for inactive and blocked users
        if (user.status === "inactive" || user.status === "blocked") {
            user.plan = "None";
        }        const row = `
            <tr>
                <td>${user.name}</td>
                <td>${user.mobile}</td>
                <td>${user.plan}</td>
                <td>${user.lastRecharge}</td>
                <td><button class="btn btn-primary view-button" data-bs-toggle="modal" data-bs-target="#detailsModal" onclick="viewDetails(this)">View</button>
                <button class="btn btn-danger update-button">Update</button></td>
                </td>

            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function viewDetails(button) {
    // Get the row data
    var row = button.parentElement.parentElement;
    var name = row.cells[0].innerText;
    
    // Find the user from the array
    var user = users.find(user => user.name === name);
    
    if (user) {
      // Set the details in the modal
      var userDetails = `
        Name: ${user.name}<br><br>
        Mobile: ${user.mobile}<br><br>
        Email: ${user.email}<br><br>
        Status: ${user.status}<br><br>
        Plan: ${user.plan}<br><br>
        Last Recharge: ${user.lastRecharge}<br><br>
        Expiry: ${user.expiry}<br>
      `;
      document.getElementById("userDetails").innerHTML = userDetails;
    
      // Show the modal
      var detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
        detailsModal.show();

    } else {
      alert("User not found");
    }
  }

  $('#detailsModal').on('hidden.bs.modal', function () {
    $('body').css('overflow', 'auto'); // Restore scrolling
    $('body').removeClass('modal-open'); // Ensure no blocking class remains
    $('.modal-backdrop').remove(); // Remove any remaining overlay
});


document.addEventListener("DOMContentLoaded", () => {
    // Function to open update modal and populate fields
    function openUpdateModal(button) {
        const row = button.closest("tr");
        const name = row.cells[0].textContent.trim();

        // Find user in the dataset
        const user = users.find(user => user.name === name);
        if (!user) return;

        // Populate modal fields
        document.getElementById("updateName").value = user.name;
        document.getElementById("updateMobile").value = user.mobile;
        document.getElementById("updateEmail").value = user.email;
        document.getElementById("updatePlan").value = user.plan;
        document.getElementById("updateLastRecharge").value = user.lastRecharge;
        document.getElementById("updateExpiry").value = user.expiry;

        const statusDropdown = document.getElementById("updateStatus");
        statusDropdown.innerHTML = ""; // Clear previous options

        statusDropdown.innerHTML += `<option value="" disabled selected>Select any one</option>`;

        // If user is blocked, only show "Unblock" as an option
        if (user.status === "blocked") {
            statusDropdown.innerHTML += `<option value="unblock">Unblock</option>`;
            document.getElementById("unblockMessage").classList.remove("d-none");
            document.getElementById("unblockUserName").textContent = user.name;
        } else {
            statusDropdown.innerHTML += `
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
            `;
            document.getElementById("unblockMessage").classList.add("d-none");
        }

        // statusDropdown.value = user.status === "blocked" ? "unblock" : user.status;

        // Show modal
        const updateModal = new bootstrap.Modal(document.getElementById("updateUserModal"));
        updateModal.show();
    }

    // Attach event listeners to update buttons
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("update-button")) {
            openUpdateModal(event.target);
        }
    });

    // Save updated user details
    document.getElementById("saveUserChanges").addEventListener("click", function () {
        const name = document.getElementById("updateName").value;
        const email = document.getElementById("updateEmail").value;
        let status = document.getElementById("updateStatus").value;

        // If user was blocked and chooses "Unblock", set status to inactive
        if (status === "unblock") {
            status = "inactive";
        }

        // Find user in the dataset
        const userIndex = users.findIndex(user => user.name === name);
        if (userIndex !== -1) {
            users[userIndex].email = email;
            users[userIndex].status = status;
            // If status is inactive or blocked, set plan to "None"
            if (status === "inactive" || status === "blocked") {
                users[userIndex].plan = "None";
            }
        }

        // Close modal after updating
        document.getElementById("updateUserModal").querySelector(".btn-close").click();

        // Refresh tables
        populateTable("active", "activeUsersTable");
        populateTable("inactive", "inactiveUsersTable");
        populateTable("blocked", "blockedUsersTable");
    });
});


$(document).ready(function () {
    $('.subscriberTable').DataTable({
        "paging": true,
        "info": true,
        "dom": '<"d-flex justify-content-between align-items-center custom-datatable-controls"lf>tip'
    });
});

// Populate tables on page load
document.addEventListener("DOMContentLoaded", () => {
    populateTable("active", "activeUsersTable");
    populateTable("inactive", "inactiveUsersTable");
    populateTable("blocked", "blockedUsersTable");
});

// Logout Function
function logout() {
    event.preventDefault();
    console.log('Logging out...');
    let logoutScreen = document.getElementById('logoutScreen');

        // Show the loading screen
        logoutScreen.style.display = 'flex';

        setTimeout(function() {
            sessionStorage.removeItem('isLoggedIn'); // Remove login session
            logoutScreen.style.display = "none"; // Hide after 2 seconds
            window.location.href = "login.html"; // Redirect to login page
        },1500);

};