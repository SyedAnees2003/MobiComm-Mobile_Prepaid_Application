document.addEventListener("DOMContentLoaded", function() {

    if (!localStorage.getItem("users")) {
        let users = [
            { mobile: "7339090778", name: "Syed Anees Jamal", email: "anees@gmail.com", address: "16C KALARAMPATTI MAIN ROAD, Salem Kitchipalayam", customer_id: "CUST1234" },
            { mobile: "9001234567", name: "John Doe", email: "john.doe@example.com", address: "123 Elm Street, New York", customer_id: "CUST5678" }
        ];
        localStorage.setItem("users", JSON.stringify(users));
    }

    loadUserProfile();
    loadAccountData();
    loadUserName();

    document.getElementById('logoutBtn').addEventListener('click', function() {
        let logoutScreen = document.getElementById('logoutScreen');

        // Show the loading screen
        logoutScreen.style.display = 'flex';

        setTimeout(function() {
            sessionStorage.removeItem('isLoggedIn'); // Remove login session
            logoutScreen.style.display = "none"; // Hide after 2 seconds
            window.location.href = "login.html"; // Redirect to login page
        },1500);

    });
});

function loadUserName() {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Get the logged-in mobile number from sessionStorage
    let loggedInMobile = sessionStorage.getItem("mobileNumber");

    // Find the user in localStorage
    let user = users.find(user => user.mobile === loggedInMobile);

    

    // If user exists, update the profile heading, otherwise default to "User Profile"
    document.getElementById("profileHeading").textContent = user ? user.name : "User Profile";
}

function loadUserProfile() {
    let loggedInMobile = sessionStorage.getItem("mobileNumber");
    let users = JSON.parse(localStorage.getItem("users"));

    let user = users.find(u => u.mobile === loggedInMobile);

    if (user) {
        document.getElementById("mobileNumberText").textContent = user.mobile;
        document.getElementById("mobileNumberInput").value = user.mobile;

        document.getElementById("emailText").textContent = user.email;
        document.getElementById("emailInput").value = user.email;

        document.getElementById("addressText").textContent = user.address;
        document.getElementById("addressInput").value = user.address;

        document.getElementById("customerIdText").textContent = user.customer_id;
        document.getElementById("ownerNameText").textContent = user.name;
    } else {
        alert("No user data found for this number.");
    }
}

function toggleEditProfile() {
    // document.getElementById("mobileNumberText").classList.toggle("d-none");
    // document.getElementById("mobileNumberInput").classList.toggle("d-none");

    document.getElementById("emailText").classList.toggle("d-none");
    document.getElementById("emailInput").classList.toggle("d-none");

    document.getElementById("addressText").classList.toggle("d-none");
    document.getElementById("addressInput").classList.toggle("d-none");

    // Toggle buttons
    document.getElementById("editProfileBtn").classList.toggle("d-none");
    document.getElementById("saveProfileBtn").classList.toggle("d-none");
}


// Save Updated Profile Data
function saveProfile() {
    let users = JSON.parse(localStorage.getItem("users"));
    let loggedInMobile = sessionStorage.getItem("mobileNumber");

    let userIndex = users.findIndex(u => u.mobile === loggedInMobile);
    if (userIndex !== -1) {
        users[userIndex].mobile = document.getElementById('mobileNumberInput').value;
        users[userIndex].email = document.getElementById('emailInput').value;
        users[userIndex].address = document.getElementById('addressInput').value;

        localStorage.setItem("users", JSON.stringify(users));
        loadUserProfile();
        toggleEditProfile();
    } else {
        alert("Error updating profile.");
    }
}

// Load Account Section Data
function loadAccountData() {
    let loggedInMobile = sessionStorage.getItem("mobileNumber");
    let users = JSON.parse(localStorage.getItem("users"));

    let user = users.find(u => u.mobile === loggedInMobile);
    if (user) {
        document.getElementById('accountMobile').textContent = user.mobile;
        document.getElementById('customerIdText').textContent = user.customer_id;
        document.getElementById('ownerNameText').textContent = user.name;
    }
}

// Tab Navigation Between Profile & Account Sections
function showSection(section, link) {
    document.getElementById('profileSection').classList.add('hidden');
    document.getElementById('accountSection').classList.add('hidden');

    document.getElementById(section + 'Section').classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    link.classList.add('active');
}

let filteredHistory = [];

function loadRechargeHistory() {
    const loggedInMobile = sessionStorage.getItem("mobileNumber");
    const loggedInName = document.getElementById("profileHeading").textContent;
    const rechargeHistory = JSON.parse(localStorage.getItem("rechargeHistory")) || [];

    filteredHistory = rechargeHistory.filter(transaction => transaction.mobile === loggedInMobile);
    
    // Reverse the array to show latest transactions first
    filteredHistory.reverse();

    const historyContainer = document.getElementById("rechargeHistory");
    historyContainer.innerHTML = ""; // Clear previous content

    if (filteredHistory.length === 0) {
        historyContainer.innerHTML = "<p>No recharge history available.</p>";
        return;
    }

    let tableHTML = `
        <table class="table" id="historyTable">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Plan</th>
                    <th>Invoice</th> <!-- New Column for Download -->
                </tr>
            </thead>
            <tbody>
    `;

    filteredHistory.forEach(transaction => {
        tableHTML += `
            <tr>
                <td>${transaction.date}</td>
                <td>${transaction.time}</td>
                <td>${transaction.transactionId}</td>
                <td>${transaction.price}</td>
                <td>${transaction.paymentMethod}</td>
                <td>${transaction.category}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="downloadInvoice('${transaction.transactionId}', '${loggedInName}', '${loggedInMobile}', '${transaction.date}', '${transaction.time}', '${transaction.price}', '${transaction.paymentMethod}', '${transaction.category}')">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    historyContainer.innerHTML = tableHTML;
}

$(document).ready(function () {
    $('#historyTable').DataTable({
        "paging": true,
        "info": true,
        "responsive": true,
        "dom": '<"d-flex justify-content-between align-items-center custom-datatable-controls my-4"fl>tip'
    });
});

//Invoice Download
function downloadInvoice(transactionId, userName, userMobile, date, time, price, paymentMethod, plan) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Load Logo (Replace 'logo.png' with your actual logo URL or Base64 string)
        const logoPath = "mobi-comm.png"; // Replace with your logo URL or base64
        const imgWidth = 40, imgHeight = 20;

        const loadImage = new Image();
        loadImage.src = logoPath;
        loadImage.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = loadImage.width;
            canvas.height = loadImage.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(loadImage, 0, 0);
            const base64Logo = canvas.toDataURL("image/png");

        // Add Logo
        doc.addImage(base64Logo, "PNG", 90, 10, imgWidth, imgHeight);
    
        // Invoice Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE", 90, 40);
    
        // Date & Time of Download
        const currentDate = new Date();
        const downloadDate = currentDate.toLocaleDateString();
        const downloadTime = currentDate.toLocaleTimeString();
    
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${downloadDate}`, 15, 50);
        doc.text(`Time: ${downloadTime}`, 160, 50);
    
        // Recharge Details in a Table Format
        const tableData = [
            ["User Name", userName],
            ["Mobile Number", userMobile],
            ["Transaction ID", transactionId],
            ["Date", date],
            ["Time", time],
            ["Amount", "Rs. " +price],
            ["Payment Method", paymentMethod],
            ["Plan", plan]
        ];
    
        // AutoTable - Creating Table
        doc.autoTable({
            startY: 60, // Position below date & time
            head: [["Title", "Details"]], // Table Header
            body: tableData,
            theme: "grid", // Table style
            styles: { fontSize: 10 },
            headStyles: { fillColor: [0, 122, 255] }, // Header Color
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 100 }, // First Column - Bold Titles
                1: { cellWidth: 100 } // Second Column - Data
            }
        });
    
        // Save the PDF
        doc.save(`Invoice_${transactionId}.pdf`);
    };
}
      


// Load data when page loads
document.addEventListener("DOMContentLoaded", loadRechargeHistory);


let lastScroll = window.scrollY;
window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;
    let header = document.querySelector("header");

    if (currentScroll < lastScroll) {
        // Show navbar when scrolling up
        header.style.top = "0";
    } else {
        // Hide navbar when scrolling down
        header.style.top = "-88px";
    }

    lastScroll = currentScroll;
});
