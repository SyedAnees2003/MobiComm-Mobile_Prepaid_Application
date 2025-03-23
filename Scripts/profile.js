document.addEventListener("DOMContentLoaded", function() {

    const mobileNumber = sessionStorage.getItem("mobileNumber");
    if (!mobileNumber) {
        // alert("❌ No user session found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    let token = sessionStorage.getItem("userToken");  // ✅ Get token
    console.log(token);

    fetchUserProfile(mobileNumber);
    fetchRechargeHistory(mobileNumber);
    setupEventListeners();
});


    // ✅ Fetch User Profile from Backend
    function fetchUserProfile(mobileNumber) {
        let token = sessionStorage.getItem("userToken");  // ✅ Get token
        console.log("fecthUser:",token);

        if (!token) {
            // alert("❌ Session expired. Please log in again.");
            window.location.href = "login.html";
            return;
        }
    
        fetch(`http://localhost:8083/api/users/${mobileNumber}`, {
            headers: { "Authorization": `Bearer ${token}` }  // ✅ Send Token
        })
        .then(response => {
            if (response.status === 401) {  // ✅ Unauthorized
                throw new Error("❌ Session expired.");
            }
            return response.json();
        })
        .then(user => {
            document.getElementById("profileHeading").textContent = `${user.firstName} ${user.lastName}`;
            const lastLoginDate = new Date(user.lastLogin);
            const formattedLastLogin = lastLoginDate.toLocaleString("en-IN", { 
                weekday: "short", 
                year: "numeric", 
                month: "short", 
                day: "numeric", 
                hour: "2-digit", 
                minute: "2-digit", 
                second: "2-digit"
            });
            
            // ✅ Display formatted last login time
            document.getElementById("lastLogin").textContent = `Last Login: ${formattedLastLogin}`;
            document.getElementById("mobileNumberText").textContent = user.mobileNumber;
            document.getElementById("accountMobile").textContent = user.mobileNumber;
            let emailElement = document.getElementById("emailText");
            if (emailElement) {
                emailElement.textContent = user.email || "Not provided";
            }

             // ✅ Format DOB Properly
        let dobElement = document.getElementById("dobText");
        if (dobElement) {
            let formattedDOB = user.dob ? new Date(user.dob).toLocaleDateString() : "Not available";
            dobElement.textContent = formattedDOB;
        }
    
            let addressElement = document.getElementById("addressText");
            if (addressElement) {
                addressElement.textContent = user.address || "Not available";
            }
    
            let customerIdElement = document.getElementById("customerIdText");
            if (customerIdElement) {
                customerIdElement.textContent = user.userId || "N/A";
            }
    
            let ownerNameElement = document.getElementById("ownerNameText");
            if (ownerNameElement) {
                ownerNameElement.textContent = `${user.firstName} ${user.lastName}`;
            }
            const address = user.street 
            ? `${user.street}, ${user.city}, ${user.state}, ${user.zipCode}`
            : "Not available";
        document.getElementById("addressText").textContent = address;
        })
        .catch(error => { console.error("❌ Error fetching user details:", error); 
            alert("❌ Session expired. Please log in again.");
            window.location.href = "login.html";
         })
        };
    

    function fetchRechargeHistory(mobileNumber) {
        const token = sessionStorage.getItem("userToken");
        console.log("fecthRecharge", token);
    
        if (!token) {
            alert("❌ Session expired. Please log in again.");
            window.location.href = "login.html";
            return;
        }
    
        fetch(`http://localhost:8083/api/users/${mobileNumber}/recharge-history`, {
            headers: {
                "Authorization": `Bearer ${token}`,  // ✅ Ensure Bearer format
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.status === 401) {
                alert("❌ Session expired. Please log in again.");
                sessionStorage.clear();
                window.location.href = "login.html";
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch recharge history.");
            return response.json();
        })
        .then(rechargeHistory => {
            displayRechargeHistory(rechargeHistory);
        })
        .catch(error => console.error("❌ Error fetching recharge history:", error));
    }    


// ✅ Display Recharge History in Table
function displayRechargeHistory(history) {
    const historyContainer = document.getElementById("rechargeHistory");
    if (history.length === 0) {
        historyContainer.innerHTML = "<p>No recharge history available.</p>";
        return;
    }

    let tableHTML = `
        <table class="table" id="historyTable">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Recharge ID</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Plan</th>
                    <th>Download Invoice</th>
                </tr>
            </thead>
            <tbody>
    `;

    history.forEach(recharge => {
        const rechargeDate = new Date(recharge.rechargeDate).toLocaleDateString();

        tableHTML += `
            <tr>
                <td>${rechargeDate}</td>
                <td>${recharge.rechargeId}</td>
                <td>₹${recharge.amount}</td>
                <td>${recharge.rechargeMode}</td>
                <td>${recharge.planName} (${recharge.validityDays} days)</td>
                <td>
                    <button class="btn btn-sm btn-primary" 
                        onclick="downloadInvoice(
                            '${recharge.rechargeId}', 
                            '${recharge.user.firstName} ${recharge.user.lastName}',
                            '${sessionStorage.getItem("mobileNumber")}', 
                            '${new Date(recharge.rechargeDate).toLocaleDateString()}', 
                            '${new Date(recharge.rechargeDate).toLocaleTimeString()}', 
                            '${recharge.amount}', 
                            '${recharge.rechargeMode}', 
                            '${recharge.planName}')">
                        <i class="fa fa-download"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    historyContainer.innerHTML = tableHTML;

    // ✅ **Destroy existing DataTable instance before reinitializing**
    if ($.fn.DataTable.isDataTable("#historyTable")) {
        $("#historyTable").DataTable().destroy();
    }

    // ✅ **Reinitialize DataTables AFTER inserting data**
    $("#historyTable").DataTable({
        "paging": true,
        "searching": true, // ✅ Enables search bar
        "info": true,
        "responsive": true,
        "autoWidth": false,
        "pageLength": 5,
        "lengthMenu": [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
        "order": [], // ✅ Prevents automatic sorting, keeps your original order
        "dom": '<"d-flex justify-content-between align-items-center custom-datatable-controls my-4"lf>tip'
    });
}


// ✅ Enable Profile Editing (Now Pre-Fills Existing Data)
function toggleEditProfile() {
    document.getElementById("emailText").classList.toggle("d-none");
    document.getElementById("emailInput").classList.toggle("d-none");

    // ✅ Pre-fill email input
    document.getElementById("emailInput").value = document.getElementById("emailText").textContent.trim();

    document.getElementById("addressText").classList.toggle("d-none");
    document.getElementById("addressInput").classList.toggle("d-none");

    document.getElementById("editProfileBtn").classList.toggle("d-none");
    document.getElementById("saveProfileBtn").classList.toggle("d-none");

    
    // ✅ Pre-fill address fields if they exist
    const addressText = document.getElementById("addressText").textContent;
    if (addressText.includes(",")) {
        const addressParts = addressText.split(", ");
        document.getElementById("streetInput").value = addressParts[0] || "";
        document.getElementById("cityInput").value = addressParts[1] || "";
        document.getElementById("stateInput").value = addressParts[2] || "";
        document.getElementById("zipInput").value = addressParts[3] || "";
    }
}


function saveProfile() {
    const mobileNumber = sessionStorage.getItem("mobileNumber");
    const token = sessionStorage.getItem("userToken");

    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const updatedProfile = {
        email: document.getElementById("emailInput").value
    };

    // ✅ Extract Address Fields Correctly
    const street = document.getElementById("streetInput").value.trim();
    const city = document.getElementById("cityInput").value.trim();
    const state = document.getElementById("stateInput").value.trim();
    const zipCode = document.getElementById("zipInput").value.trim();

    if (street || city || state || zipCode) {
        updatedProfile.address = { street, city, state, zipCode };
    }

    fetch(`http://localhost:8083/api/users/${mobileNumber}/update-profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error("❌ Unauthorized. Token expired or invalid.");
        }
        if (!response.ok) throw new Error("Failed to update profile.");
        return response.text(); // ✅ Read response as text (not JSON)
    })
    .then(message => {
        console.log("✅ Server Response:", message);
        $('#successModal').modal('show');
        fetchUserProfile(mobileNumber);
        toggleEditProfile();
    })
    .catch(error => {
        console.error("❌ Error updating profile:", error);
        alert(error.message);
    });
}



// ✅ Setup Event Listeners
function setupEventListeners() {
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
}

// ✅ Handle Logout
function handleLogout(event) {
    event.preventDefault();
    let logoutScreen = document.getElementById("logoutScreen");
    logoutScreen.style.display = "flex";

    const token = sessionStorage.getItem("userToken");
    if (!token) {
        alert("❌ No active session found.");
        logoutScreen.style.display = "none";
        window.location.href = "login.html";
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
        setTimeout(() => {
            sessionStorage.clear();
            logoutScreen.style.display = "none";
            window.location.href = "login.html";
        }, 1500);
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Logout failed: " + error.message);
        logoutScreen.style.display = "none";
    });
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
        const imgWidth = 70; // Adjust width as needed
        const imgHeight = 15; // Adjust height as needed
        const pageWidth = doc.internal.pageSize.getWidth(); // Get page width
        
        // Centering the logo
        const centerX = (pageWidth - imgWidth) / 2;
        
        doc.addImage(base64Logo, "PNG", centerX, 10, imgWidth, imgHeight);
            
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
            ["Recharge ID", transactionId],
            ["Date", date],
            ["Time", time],
            ["Amount", "Rs. " +price],
            ["Payment Method", paymentMethod],
            ["Plan", plan]
        ];
    
        // AutoTable - Creating Table
        doc.autoTable({
        startY: 60, // Position below date & time
        head: [["Title", "Details"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }, // Ensure left & right spacing
        headStyles: { fillColor: [0, 122, 255] },
        tableWidth: "auto", // Ensures table does not extend to full width
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 70 }, // Title column
            1: { cellWidth: 90 } // Details column
        }
    });    
    
        // Save the PDF
        doc.save(`Invoice_${transactionId}.pdf`);
    };
}
      

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
