document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("userToken"); // Check token presence
    const profileMenu = document.getElementById("profileMenu");
    const loginMenu = document.getElementById("loginMenu");

    if (token) {
        // Show Profile Dropdown for Logged-in Users
        profileMenu.classList.remove("d-none");
        loginMenu.classList.add("d-none");
    } 
    else {
        // Show Login Dropdown for Guests
        loginMenu.classList.remove("d-none");
        profileMenu.classList.add("d-none");
    }

    loadRecentRequest();

});
    

document.getElementById("nav-offers").addEventListener("click", function() {
    alert("No offers available at the moment.");
});
    function showMoreFAQs() {
        event.preventDefault();
        document.getElementById('more-faqs').style.display = 'block';
        document.getElementById('see-more-link').style.display = 'none';
    }

    let lastScrollTop = 0;
    const navbar = document.querySelector("header");
    
    window.addEventListener("scroll", function () {
        let currentScroll = window.scrollY;
    
        if (currentScroll > lastScrollTop) {
            // Scrolling down → Hide navbar
            navbar.style.top = "-90px"; // Adjust based on navbar height
        } else {
            // Scrolling up → Show navbar
            navbar.style.top = "0";
        }
    
        lastScrollTop = currentScroll;
    });

document.querySelector(".form-fill").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page refresh

    const successModal = new bootstrap.Modal(document.getElementById("successModal"));


    // const token = sessionStorage.getItem("userToken");
    // if (!token) {
    //     alert("❌ Session expired. Please log in again.");
    //     window.location.href = "login.html";
    //     return;
    // }

    fetch("http://localhost:8083/api/support-tickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            mobileNumber: document.getElementById("mobile").value,  // ✅ Use mobile number
            issueType: document.getElementById("subject").value,
            issueDescription: document.getElementById("query").value,
        }),
    })
    .then(response => response.text())
    .then(data => {
        console.log("✅ Success:", data);
        document.querySelector(".form-fill").reset(); // Reset form
        successModal.show();
    })
    .catch(error => {
        console.error("❌ Error:", error);
        alert("❌ Failed to submit ticket.");
    });    
});

// ✅ Load Recent Request from Backend
function loadRecentRequest() {
    const token = sessionStorage.getItem("userToken");
    if (!token) return;

    const mobileNumber = sessionStorage.getItem("mobileNumber");  // ✅ Get mobile number
    if (!mobileNumber) return console.error("❌ Mobile number not found in session!");

    fetch(`http://localhost:8083/api/support-tickets/recent/${mobileNumber}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(ticket => {
        if (!ticket || Object.keys(ticket).length === 0) {
            document.getElementById("recentRequest").innerHTML = "<p>No recent requests.</p>";
            return;
        }

        document.getElementById("recentRequest").innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h6>ID: ${ticket.ticketId}</h6>
                <span class="badge bg-${ticket.status === 'open' ? 'primary' : ticket.status === 'pending' ? 'warning' : 'success'}">${ticket.status}</span>
            </div>
            <p class="text-muted">Subject: ${ticket.issueType}</p>
            <p>${new Date(ticket.createdAt).toLocaleString()}</p>
        `;
    })
    .catch(error => console.error("❌ Error fetching recent request:", error));
}


// ✅ Open and Load All Support Requests
function openRequestsModal() {
    const modal = new bootstrap.Modal(document.getElementById("requestsModal"));
    modal.show();
    loadAllRequests();  // Load all user requests
}

function loadAllRequests() {
    const token = sessionStorage.getItem("userToken");
    if (!token) return;

    const mobileNumber = sessionStorage.getItem("mobileNumber");  // ✅ Get mobile number from session
    if (!mobileNumber) return console.error("❌ Mobile number not found in session!");

    fetch(`http://localhost:8083/api/support-tickets/user/${mobileNumber}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(tickets => {
        const requestsDiv = document.getElementById("allRequests");
        requestsDiv.innerHTML = ""; // Clear previous content

        if (!tickets || tickets.length === 0) {
            requestsDiv.innerHTML = "<p>No support requests found.</p>";
            return;
        }

        tickets.forEach(ticket => {
            let requestCard = document.createElement("div");
            requestCard.classList.add("card", "shadow", "p-3", "mb-3");
            requestCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <h5>${ticket.issueType}</h5>
                    <span class="badge bg-${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
                </div>
                <p class="text-muted small">ID: ${ticket.ticketId}</p>
                <p><strong>Date:</strong> ${formatDate(ticket.createdAt)}</p>
                <p><strong>Priority:</strong> <span class="badge bg-${getPriorityBadgeClass(ticket.priority)}">${ticket.priority}</span></p>
                <p><strong>Query:</strong> ${ticket.issueDescription}</p>
            `;
            requestsDiv.appendChild(requestCard);
        });
    })
    .catch(error => console.error("❌ Error fetching support requests:", error));
}

// ✅ Function to get badge color for status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case "open": return "primary";
        case "pending": return "warning";
        case "resolved": return "success";
        default: return "secondary";
    }
}

// ✅ Function to get badge color for priority
function getPriorityBadgeClass(priority) {
    switch (priority.toLowerCase()) {
        case "high": return "danger";
        case "medium": return "warning";
        case "low": return "success";
        default: return "secondary";
    }
}

// ✅ Function to format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

// ✅ Event Listener to open modal when the chevron is clicked
document.getElementById("chevronLeft").addEventListener("click", openRequestsModal);

     function showSection(sectionId, clickedLink) {
        event.preventDefault();
        // Hide all sections
        document.getElementById('connect').style.display = 'none';
        document.getElementById('faq').style.display = 'none';

        // Show the selected section
        document.getElementById(sectionId).style.display = 'block';

        // Update active class on navigation links
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

        function showMoreFAQs() {
        event.preventDefault();
        const moreFAQs = document.getElementById('more-faqs');
        const seeMoreLink = document.getElementById('see-more-link');
        if (moreFAQs.style.display === 'none') {
            moreFAQs.style.display = 'block';
            seeMoreLink.textContent = 'See less';
        } else {
            moreFAQs.style.display = 'none';
            seeMoreLink.textContent = 'See more';
        }
    }

// ✅ Scroll-to-Top Button
var scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.onscroll = function() {
    scrollToTopBtn.style.display = (document.documentElement.scrollTop > 400) ? "block" : "none";
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}