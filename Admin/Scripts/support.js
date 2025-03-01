let tickets = [
    // Open Tickets (3)
    { id: 'T1001', user: 'John Doe', email: 'john.doe@example.com', mobile: '9876543210', subject: 'Payment Issue', priority: 'High', status: 'Open' },
    { id: 'T1004', user: 'Anna Scott', email: 'anna.scott@example.com', mobile: '9123456789', subject: 'Technical Issue', priority: 'High', status: 'Open' },
    { id: 'T1007', user: 'David Brown', email: 'david.brown@example.com', mobile: '9988776655', subject: 'Recharge Failure', priority: 'Medium', status: 'Open' },

    // Pending Tickets (3)
    { id: 'T1002', user: 'Jane Smith', email: 'jane.smith@example.com', mobile: '9871234567', subject: 'Account Access', priority: 'Medium', status: 'Pending' },
    { id: 'T1005', user: 'Emily White', email: 'emily.white@example.com', mobile: '9234567890', subject: 'Verification Issue', priority: 'High', status: 'Pending' },
    { id: 'T1008', user: 'Chris Johnson', email: 'chris.johnson@example.com', mobile: '9345678901', subject: 'Billing Error', priority: 'Low', status: 'Pending' },

    // Resolved Tickets (3)
    { id: 'T1003', user: 'Mike Lee', email: 'mike.lee@example.com', mobile: '9543216789', subject: 'Plan Inquiry', priority: 'Low', status: 'Resolved' },
    { id: 'T1006', user: 'Sarah Green', email: 'sarah.green@example.com', mobile: '9654321876', subject: 'Refund Request', priority: 'Medium', status: 'Resolved' },
    { id: 'T1009', user: 'James Wilson', email: 'james.wilson@example.com', mobile: '9765432189', subject: 'Network Issue', priority: 'High', status: 'Resolved' }
];

$(document).ready(function () {

    let recentTickets = [
        { id: 'T1001', user: 'John Doe', email: 'john.doe@example.com', mobile: '9876543210', subject: 'Payment Issue', priority: 'High', status: 'Open' },
        { id: 'T1002', user: 'Jane Smith', email: 'jane.smith@example.com', mobile: '9871234567', subject: 'Account Access', priority: 'Medium', status: 'Pending' },
        { id: 'T1003', user: 'Mike Lee', email: 'mike.lee@example.com', mobile: '9543216789', subject: 'Plan Inquiry', priority: 'Low', status: 'Resolved' }
    ];

    // Check if tickets exist in localStorage
    let storedTickets = localStorage.getItem("supportTickets");

    // If not, initialize with default tickets
    if (!storedTickets) {
        localStorage.setItem("supportTickets", JSON.stringify(tickets));
    } 
    else {
        tickets = JSON.parse(storedTickets);
    }
    console.log(storedTickets);

    //Add new Support Request
    function addNewSupportRequest(newTicket) {
        // Add the new ticket to the array
        tickets.push(newTicket);
    
        localStorage.setItem("supportTickets", JSON.stringify(tickets));
    
        // Repopulate the tables to reflect the new ticket
        populateFilteredTables(tickets);
    }
    
    //cards
    recentTickets.forEach(ticket => {
        $("#recentSupportCards").append(`
            <div class="p-3 border rounded shadow-sm d-flex flex-column align-items-center" style="width: 48%; min-width: 300px;">
                <h6 class="fw-bold text-center mb-3">${ticket.subject}</h6>
                <div class="d-flex justify-content-evenly w-100 mb-2">
                    <strong>User:</strong> <span>${ticket.user}</span>
                </div>
                <div class="d-flex justify-content-evenly  w-100 mb-2">
                    <strong>Priority:</strong> <span class="badge bg-${ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'success'}">${ticket.priority}</span>
                </div>
                <div class="d-flex justify-content-evenly  w-100 mb-3">
                    <strong>Status:</strong> <span class="badge bg-${ticket.status === 'Open' ? 'primary' : ticket.status === 'Pending' ? 'secondary' : 'success'}">${ticket.status}</span>
                </div>
                <button class="btn btn-primary view-ticket" data-id="${ticket.id}">View</button>
            </div>
        `);
    });

    function populateInitialTables() {
        populateFilteredTables(tickets); // Load all tickets initially
    }
    
    function populateFilteredTables(filteredTickets) {
        let pendingTbody = $("#pendingTable tbody");
        let openTbody = $("#openTable tbody");
        let resolvedTbody = $("#resolvedTable tbody");
    
        // Clear existing rows
        pendingTbody.empty();
        openTbody.empty();
        resolvedTbody.empty();
    
        // Loop through the filtered tickets and populate tables
        filteredTickets.forEach(ticket => {
            let row = `<tr>
                <td>${ticket.id}</td>
                <td>${ticket.user}</td>
                <td>${ticket.subject}</td>
                <td><span class="badge bg-${ticket.priority === 'High' ? 'danger' : ticket.priority === 'Medium' ? 'warning' : 'success'}">${ticket.priority}</span></td>
                <td><button class='btn btn-primary btn-sm view-ticket' data-id='${ticket.id}'>View</button></td>
            </tr>`;
    
            if (ticket.status === 'Pending') {
                pendingTbody.append(row);
            } else if (ticket.status === 'Open') {
                openTbody.append(row);
            } else if (ticket.status === 'Resolved') {
                resolvedTbody.append(row);
            }
        });
    }
    
    populateInitialTables();

    $("#statusFilter, #priorityFilter, #searchTicket").on("input", function () {
        let status = $("#statusFilter").val();
        let priority = $("#priorityFilter").val();
        let searchText = $("#searchTicket").val().toLowerCase();

        let filteredTickets = tickets.filter(ticket => {
            return (!status || ticket.status === status) &&
                   (!priority || ticket.priority === priority) &&
                   (ticket.user.toLowerCase().includes(searchText) || ticket.subject.toLowerCase().includes(searchText));
        });

        populateFilteredTables(filteredTickets); // Update table with filtered results

    });


    // Initialize the toast
    const toastElement = document.getElementById('successToast');
    const toast = new bootstrap.Toast(toastElement);

    // Event listener for View button
    $(document).on("click", ".view-ticket", function () {
        let ticketId = $(this).data("id");
        let ticket = tickets.find(t => t.id === ticketId);

        if (ticket) {
            // Populate modal with ticket details
            $("#modalTicketId").text(ticket.id);
            $("#modalUser").text(ticket.user);
            $("#modalSubject").text(ticket.subject);
            $("#modalPriority").text(ticket.priority);
            $("#modalStatus").text(ticket.status);

            // Set the current status and priority in the dropdowns
            $("#statusChange").val(ticket.status);
            $("#priorityChange").val(ticket.priority);

            // Reset the compose message section
            $("#composeMessageSection").hide();
            $("#messageTo").val(ticket.mobile);
            $("#messageInput").val("");

            // Show the modal
            $("#ticketModal").modal("show");
        }
    });

    // Event listener for Save Changes button
    $("#saveChanges").on("click", function () {
        let newStatus = $("#statusChange").val();
        let newPriority = $("#priorityChange").val();

        if (!newStatus || !newPriority) {
            alert("Please select a valid status and priority.");
            return;
        }

        // Show confirmation modal
        $("#confirmationModal").modal("show");
    });

    // Event listener for Confirm Save Changes button
    $("#confirmSaveChanges").on("click", function () {
        let ticketId = $("#modalTicketId").text();
        let newStatus = $("#statusChange").val();
        let newPriority = $("#priorityChange").val();

        // Update the ticket status and priority in the tickets array
        let ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = newStatus;
            ticket.priority = newPriority;
        }

        // Repopulate the tables to reflect the updated status and priority
        populateInitialTables();

        $("#confirmationModal").modal("hide");
        $("#ticketModal").modal("hide");
    });

    // Event listener for Compose Message button
    $("#composeMessageButton").on("click", function () {
        $("#composeMessageSection").toggle(); // Toggle visibility of the compose message section
    });

    // Event listener for Send Message button
    $("#sendMessage").on("click", function () {
        let message = $("#messageInput").val();
        let recipientMobile = $("#messageTo").val(); // This should match the ticket.mobile field
    
        if (message.trim() === "") {
            alert("Please enter a message.");
            return;
        }
    
        if (message.length > 500) {
            alert("Message cannot exceed 500 characters.");
            return;
        }
    
        // Find the user in the users array using the mobile number
        let users = JSON.parse(localStorage.getItem("users")) || [];
        let user = users.find(u => u.mobile === recipientMobile);
    
        if (user) {
            // Create a new notification
            let newNotification = {
                id: `N${Date.now()}`, // Generate a unique ID
                text: `Support Response: ${message}`,
                seen: false,
                link: "notifications.html",
                timestamp: new Date().toISOString() // Add timestamp
            };
    
            // Add the notification to the user's notifications
            let notificationKey = `notifications_${user.mobile}`; // Unique key for user-specific notifications
            let notifications = JSON.parse(localStorage.getItem(notificationKey)) || [];
            notifications.push(newNotification);
    
            // Save the updated notifications back to localStorage
            localStorage.setItem(notificationKey, JSON.stringify(notifications));
    
            // Log the message (for now)
            console.log(`Message sent to ${user.name} (${user.mobile}): ${message}`);
    
            // Show success toast
            toast.show();
    
            // Clear the message input and hide the compose section
            $("#messageInput").val("");
            $("#composeMessageSection").hide();
        } else {
            alert("User not found.");
        }
    });

     // Count tickets by status
     let statusCounts = { Open: 0, Pending: 0, Resolved: 0 };
     let priorityCounts = { High: 0, Medium: 0, Low: 0 };
 
     tickets.forEach(ticket => {
         statusCounts[ticket.status]++;
         priorityCounts[ticket.priority]++;
     });

    // 🎯 Ticket Status Pie Chart
    new Chart(document.getElementById("Supportchart"), {
        type: "pie",
        data: {
            labels: ["Open", "Pending", "Resolved"],
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ["#007bff", "#ffc107", "#28a745"],
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
        }
    });

    // 🎯 Ticket Priority Bar Chart
    new Chart(document.getElementById("PriorityChart"), {
        type: "bar",
        data: {
            labels: ["High", "Medium", "Low"],
            datasets: [{
                label: "Number of Tickets",
                data: Object.values(priorityCounts),
                backgroundColor: ["#dc3545", "#ffc107", "#28a745"]
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
});

function downloadCSV() {
    let tables = document.querySelectorAll(".tab-content table"); // Select all tables inside the tab content
    let csvContent = "";

    tables.forEach((table, index) => {
        let rows = table.querySelectorAll("tr");
        
        // Skip empty tables (when no tickets are present)
        if (rows.length <= 1) return;

        // Add table title (tab name) to the CSV
        let tabTitle = table.closest(".tab-pane").getAttribute("aria-labelledby");
        tabTitle = document.getElementById(tabTitle).innerText; // Get the tab name
        csvContent += (index === 0 ? "" : "\n\n") + tabTitle + "\n"; // Add tab title to CSV

        // Add table headers
        let headers = [];
        rows[0].querySelectorAll("th").forEach(header => headers.push(header.innerText.replace(/,/g, "")));
        csvContent += headers.join(",") + "\n";

        // Add table rows
        for (let i = 1; i < rows.length; i++) {
            let rowData = [];
            rows[i].querySelectorAll("td").forEach(col => rowData.push(col.innerText.replace(/,/g, ""))); // Remove commas for clean CSV
            csvContent += rowData.join(",") + "\n";
        }
    });

    // Create a Blob and trigger the download
    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "support_requests_report.csv";
    link.click();
}
    

function logout(){
    event.preventDefault();
    sessionStorage.removeItem('loggedInAdmin');
    window.location.href='login.html';
}