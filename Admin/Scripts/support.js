    const token = sessionStorage.getItem("adminToken");
    
    if (!token) {
        // alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        // return;
    }

    document.addEventListener('DOMContentLoaded', function () {

        fetchSupportTickets();
        fetchRecentSupportRequests();

    });

    function fetchRecentSupportRequests() {
        fetch("http://localhost:8083/api/support-tickets/recent", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(recentTickets => {
            $("#recentSupportCards").empty(); // Clear previous data
    
            recentTickets.forEach(ticket => {
                $("#recentSupportCards").append(`
                    <div class="p-3 border rounded shadow-sm d-flex flex-column align-items-center" style="width: 48%; min-width: 300px;">
                        <h5 class="text-center mb-3">${ticket.issueType}</h6>
                        <div class="d-flex justify-content-evenly w-100 mb-2">
                            <h6>User:</h6> <span>${ticket.user.firstName} ${ticket.user.lastName}</span>
                        </div>
                        <div class="d-flex justify-content-evenly w-100 mb-2">
                            <h6>Priority:</h6> 
                            <span class="badge bg-${ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'success'}">
                                ${ticket.priority}
                            </span>
                        </div>
                        <div class="d-flex justify-content-evenly w-100 mb-3">
                            <h6>Status:</h6> 
                            <span class="badge bg-${ticket.status === 'open' ? 'primary' : ticket.status === 'pending' ? 'secondary' : 'success'}">
                                ${ticket.status}
                            </span>

                `);
            });
        })
        .catch(error => console.error("Error fetching recent tickets:", error));
    }

    let supports = [];
    // Fetch all support tickets from the backend
    function fetchSupportTickets() {
        fetch("http://localhost:8083/api/support-tickets", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch support tickets.");
            }
            return response.json();
        })
        .then(data => {
            console.log("Tickets Data" , data);
            supports = data;
            populateFilteredTables(supports); // Populate tables with API data
            updateDashboardStats(supports);

                            generateSupportStatusChart(supports);
                generatePriorityChart(supports);
        })
        .catch(error => console.error("Error:", error));
    }

    function populateFilteredTables(filteredTickets) {
        let pendingTbody = $("#pendingTable tbody");
        let openTbody = $("#openTable tbody");
        let resolvedTbody = $("#resolvedTable tbody");

        pendingTbody.empty();
        openTbody.empty();
        resolvedTbody.empty();

        filteredTickets.forEach(ticket => {
            let row = `<tr>
                <td>${ticket.ticketId}</td>
                <td>${ticket.user.firstName} ${ticket.user.lastName}</td>
                <td>${ticket.user.mobileNumber}</td>
                <td>${ticket.issueType}</td>
                <td><span class="badge bg-${getPriorityColor(ticket.priority)}">${ticket.priority}</span></td>
                <td><button class='btn btn-primary btn-sm view-ticket' data-id='${ticket.ticketId}'>View</button>
                ${ticket.status !== "resolved" ? `<button type="button" class="btn btn-success btn-sm ms-2 resolve-request" data-id='${ticket.ticketId}'>Resolve</button>` : ""}
                </td>
            </tr>`;

            if (ticket.status === 'pending') {
                pendingTbody.append(row);
            } else if (ticket.status === 'open') {
                openTbody.append(row);
            } else if (ticket.status === 'resolved') {
                resolvedTbody.append(row);
            }
        });
    }

    function getPriorityColor(priority) {
        return priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'success';
    }

    $("#statusFilter, #priorityFilter, #searchTicket").on("input", function () {
        let status = $("#statusFilter").val().trim().toLowerCase();
        let priority = $("#priorityFilter").val().trim().toLowerCase();
        let searchText = $("#searchTicket").val().trim().toLowerCase();
    
        let filteredTickets = supports.filter(ticket => {
            let ticketStatus = ticket.status ? ticket.status.toLowerCase() : "";
            let ticketPriority = ticket.priority ? ticket.priority.toLowerCase() : "";
            let userName = ticket.user ? (ticket.user.firstName + " " + ticket.user.lastName).toLowerCase() : "";
            let issueType = ticket.issueType ? ticket.issueType.toLowerCase() : "";
            let mobilenumber = ticket.user ? ticket.user.mobileNumber : "";
    
            return (!status || ticketStatus === status) &&
                   (!priority || ticketPriority === priority) &&
                   (userName.includes(searchText) || issueType.includes(searchText) || mobilenumber.includes(searchText));
        });
    
        console.log("Filtered Tickets: ", filteredTickets);  // Debugging
    
        populateFilteredTables(filteredTickets);
    });    

    function updateDashboardStats(tickets) {
        let totalRequests = tickets.length;
        let openRequests = tickets.filter(ticket => ticket.status.toLowerCase() === "open").length;
        let pendingRequests = tickets.filter(ticket => ticket.status.toLowerCase() === "pending").length;
        let resolvedRequests = tickets.filter(ticket => ticket.status.toLowerCase() === "resolved").length;
    
        document.getElementById("totalRequests").innerText = totalRequests;
        document.getElementById("openRequests").innerText = openRequests;
        document.getElementById("pendingRequests").innerText = pendingRequests;
        document.getElementById("resolvedRequests").innerText = resolvedRequests;
    }


    // Initialize the toast
    const toastElement = document.getElementById('successToast');
    const toast = new bootstrap.Toast(toastElement);

    // Event listener for View button to open modal and populate details
    $(document).on("click", ".view-ticket", function () {
        let ticketId = $(this).data("id");
        let ticket = supports.find(t => t.ticketId === ticketId);

        if (ticket) {
            // Populate modal with ticket details
            $("#modalTicketId").text(ticket.ticketId);
            $("#modalUser").text(`${ticket.user.firstName} ${ticket.user.lastName}`);
            $("#modalMobile").text(`${ticket.user.mobileNumber}`);
            $("#modalSubject").text(ticket.issueType);
            $("#modalPriority").text(ticket.priority);
            $("#modalStatus").text(ticket.status);

            // Reset the compose message section (keeping it static for now)
            $("#composeMessageSection").hide();
            $("#messageTo").val(ticket.user.mobileNumber);
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

    // Show confirmation modal before applying changes
    $("#confirmationModal").modal("show");

});

// Event listener for Confirm Save Changes button
$("#confirmSaveChanges").on("click", function () {
    let ticketId = $("#modalTicketId").text();  // Use hidden input instead of text
    let newStatus = $("#statusChange").val();
    let newPriority = $("#priorityChange").val();

    if (!ticketId) {
        console.log("ticketId: ",ticketId);
        alert("Error: Ticket ID is missing.");
        return;
    }

    // Prepare the request payload
    let requestData = {
        status: newStatus.toLowerCase(),
        priority: newPriority.toLowerCase()
    };

    $("#ticketModal").modal("hide");

    // Call the backend API to update the ticket
    fetch(`http://localhost:8083/api/support-tickets/${ticketId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Ticket updated successfully:", data);

        // Update the ticket in the frontend table
        let ticket = supports.find(t => t.ticketId == ticketId);
        if (ticket) {
            ticket.status = newStatus;
            ticket.priority = newPriority;
        }

        // Refresh the tables
        fetchSupportTickets();

        // Hide modals
        $("#confirmationModal").modal("hide");

        // alert("Ticket updated successfully!");
    })
    .catch(error => {
        console.error("Error updating ticket:", error);
        alert("Failed to update the ticket.");
    });

});


let selectedTicketId = null; // Store ticket ID globally

$(document).on("click", ".resolve-request", function () {
    selectedTicketId = $(this).data("id"); // Store ticket ID
    console.log("Opening modal for ticket:", selectedTicketId);

    $("#resolveConfirmModal").modal("show"); // Open confirmation modal
});

$(document).on("click", "#confirmResolve", async function () {
    if (!selectedTicketId) {
        alert("Error: Ticket ID is missing.");
        return;
    }

    let adminToken = sessionStorage.getItem("adminToken");
    if (!adminToken) {
        alert("Error: Admin not logged in.");
        return;
    }

    try {
        // Fetch logged-in admin details
        let adminResponse = await fetch("http://localhost:8083/api/admin/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${adminToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!adminResponse.ok) {
            throw new Error(`Failed to fetch admin details: ${adminResponse.status}`);
        }

        let adminData = await adminResponse.json();
        console.log(adminData);

        let requestData = {
            status: "resolved",
            resolvedAt: new Date().toISOString(),
            resolvedByAdmin: adminData.userId
        };

        // Call API to resolve the ticket
        let response = await fetch(`http://localhost:8083/api/support-tickets/resolve/${selectedTicketId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Failed to resolve ticket: ${response.status}`);
        }

        let updatedTicket = await response.json();
        console.log("Ticket resolved successfully:", updatedTicket);

        // Close the modal
        $("#resolveConfirmModal").modal("hide");

        // Update UI
        let ticket = supports.find(t => t.ticketId == selectedTicketId);
        if (ticket) {
            ticket.status = "resolved";
            ticket.resolvedAt = requestData.resolvedAt;
            ticket.resolvedByAdmin = requestData.resolvedByAdmin;
        }

        fetchSupportTickets(); // Refresh the ticket list
    } catch (error) {
        console.error("Error resolving ticket:", error);
        alert("Failed to resolve the ticket.");
    }
});


    // Event listener for Compose Message button
    $("#composeMessageButton").on("click", function () {
        $("#composeMessageSection").toggle(); // Toggle visibility of the compose message section
    });

    document.getElementById("sendMessage").addEventListener("click", function() {
        let mobile = document.getElementById("messageTo").value;
        let message = document.getElementById("messageInput").value.trim();
    
        if (!mobile) {
            alert("User mobile number is missing!");
            return;
        }
    
        if (message.length === 0) {
            alert("Message cannot be empty!");
            return;
        }
    
        let requestBody = {
            mobile: mobile,
            message: message
        };
    
        fetch("http://localhost:8083/api/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.text())
        .then(data => {
            showToast("✅ Notification sent successfully!", "success");
            document.getElementById("messageInput").value = ""; // Clear input
        })
        .catch(error => console.error("Error sending message:", error));
    });
    

    function showToast(message, type = "success") {
        let toast = document.getElementById("customToast");
        let toastMessage = document.getElementById("toastMessage");
    
        // Set the message
        toastMessage.innerText = message;
    
        // Set class based on type (success, error, etc.)
        toast.classList.remove("hidden", "error", "success");
        toast.classList.add(type);
    
        // Show toast
        toast.style.opacity = "1";
        toast.style.bottom = "20px";
    
        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => {
                toast.classList.add("hidden");
            }, 500);
        }, 3000);
    }


    // Function to generate Support Status Chart
function generateSupportStatusChart(tickets) {
    let statusCounts = {
        open: 0,
        pending: 0,
        resolved: 0
    };

    tickets.forEach(ticket => {
        let status = ticket.status.toLowerCase();
        if (statusCounts[status] !== undefined) {
            statusCounts[status]++;
        }
    });

    let ctx = document.getElementById("Supportchart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Open", "Pending", "Resolved"],
            datasets: [{
                data: [statusCounts.open, statusCounts.pending, statusCounts.resolved],
                backgroundColor: ["#54a8fb", "#f1c40f", "#2ecc71"]
            }]
        }
    });
}

// Function to generate Priority Chart
function generatePriorityChart(tickets) {
    let priorityCounts = {
        high: 0,
        medium: 0,
        low: 0
    };

    tickets.forEach(ticket => {
        let priority = ticket.priority.toLowerCase();
        if (priorityCounts[priority] !== undefined) {
            priorityCounts[priority]++;
        }
    });

    let ctx = document.getElementById("PriorityChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["High", "Medium", "Low"],
            datasets: [{
                label: "Ticket Priority",
                data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
                backgroundColor: ["#e74c3c", "#f1c40f", "#2ecc71"]
            }]
        }
    });
}

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


function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();
    
    // ✅ Add Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255); // Blue color
    doc.text("MobiComm", 105, 20, { align: "center" });

    // ✅ Add Date & Time
    let currentDate = new Date().toLocaleDateString();
    let currentTime = new Date().toLocaleTimeString();
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(`Date: ${currentDate}`, 15, 25);
    doc.text(`Time: ${currentTime}`, 160, 25);

    // ✅ Table Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Support Requests Report", 15, 40);

    // ✅ Table Data Collection
    let data = [];
    let tables = document.querySelectorAll(".tab-content table");

    tables.forEach((table) => {
        let rows = table.querySelectorAll("tr");
        if (rows.length <= 1) return;

        // Headers
        let headers = [];
        rows[0].querySelectorAll("th").forEach(header => headers.push(header.innerText));

        // Rows
        let tableData = [];
        for (let i = 1; i < rows.length; i++) {
            let rowData = [];
            rows[i].querySelectorAll("td").forEach(col => rowData.push(col.innerText));
            tableData.push(rowData);
        }

        data.push({ headers, body: tableData });
    });

    // ✅ Add Table to PDF
    let startY = 50;
    data.forEach((table, index) => {
        doc.autoTable({
            head: [table.headers],
            body: table.body,
            startY: startY,
            margin: { left: 15, right: 15 }
        });
        startY = doc.lastAutoTable.finalY + 10; // Move down for next table
    });

    // ✅ Trigger Download
    doc.save("support_requests_report.pdf");
}

    

// ✅ Admin Logout Function (With API Integration)
function logout() {
    event.preventDefault(); // Prevent default link behavior
    console.log("🔹 Logging out...");

    let logoutScreen = document.getElementById("logoutScreen");
    logoutScreen.style.display = "flex"; // Show loading screen

    const token = sessionStorage.getItem("adminToken");

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
        setTimeout(() => {
            logoutScreen.style.display = "none";
            window.location.href = "login.html";
        }, 2000); // ✅ Redirect to Login Page
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Logout failed: " + error.message);
        logoutScreen.style.display = "none";
        window.location.href="login.html";
    });
}
