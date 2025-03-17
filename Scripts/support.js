//     document.getElementById("nav-offers").addEventListener("click", function() {
//     alert("No offers available at the moment.");
// });
//     function showMoreFAQs() {
//         event.preventDefault();
//         document.getElementById('more-faqs').style.display = 'block';
//         document.getElementById('see-more-link').style.display = 'none';
//     }

//     let lastScrollTop = 0;
//     const navbar = document.querySelector("header");
    
//     window.addEventListener("scroll", function () {
//         let currentScroll = window.scrollY;
    
//         if (currentScroll > lastScrollTop) {
//             // Scrolling down → Hide navbar
//             navbar.style.top = "-90px"; // Adjust based on navbar height
//         } else {
//             // Scrolling up → Show navbar
//             navbar.style.top = "0";
//         }
    
//         lastScrollTop = currentScroll;
//     });
    
//     document.addEventListener("DOMContentLoaded", function () {
//         const form = document.querySelector(".form-fill");
//         const successModal = new bootstrap.Modal(document.getElementById("successModal"));
//         const closeModalBtns = document.querySelectorAll('[data-bs-dismiss="modal"]');

//         form.addEventListener("submit", function (event) {
//             event.preventDefault(); // Prevents page refresh

//             const token = generateToken();
//             // Create a support request object
//         const supportRequest = {
//             id: token,
//             user: document.getElementById("name").value,
//             email: document.getElementById("email").value,
//             mobile: document.getElementById("mobile").value,
//             subject: document.getElementById("subject").value,
//             query: document.getElementById("query").value,
//             priority: "Medium", // Default priority
//             status: "Pending", // Default status
//             timestamp: new Date().toISOString() // Add timestamp
//         };

//         // Save the support request to localStorage
//         saveSupportRequest(supportRequest);
    
//         successModal.show(); // Show the modal
//         form.reset(); // Reset form after submission
//     });

//     // Optional: Manually close modal on clicking OK or Close button
//     closeModalBtns.forEach(button => {
//         button.addEventListener("click", function () {
//             successModal.hide();
//         });
//     });
//     });

//     function generateToken() {
//         return 'T' + Math.random().toString(36).substr(2, 9).toUpperCase(); // Example: TABC123XYZ
//     }

//     function saveSupportRequest(request) {
//         // Retrieve existing support requests from localStorage
//         let supportRequests = JSON.parse(localStorage.getItem("supportTickets")) || [];
    
//         // Add the new request
//         supportRequests.push(request);
    
//         // Save back to localStorage
//         localStorage.setItem("supportTickets", JSON.stringify(supportRequests));

//         console.log(localStorage.getItem("supportTickets"));
//     }


//      // Function to show/hide sections
//      function showSection(sectionId, clickedLink) {
//         event.preventDefault();
//         // Hide all sections
//         document.getElementById('connect').style.display = 'none';
//         document.getElementById('faq').style.display = 'none';

//         // Show the selected section
//         document.getElementById(sectionId).style.display = 'block';

//         // Update active class on navigation links
//         document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
//         clickedLink.classList.add('active');
//     }

//     // Function to show more FAQs
//     function showMoreFAQs() {
//         event.preventDefault();
//         const moreFAQs = document.getElementById('more-faqs');
//         const seeMoreLink = document.getElementById('see-more-link');
//         if (moreFAQs.style.display === 'none') {
//             moreFAQs.style.display = 'block';
//             seeMoreLink.textContent = 'See less';
//         } else {
//             moreFAQs.style.display = 'none';
//             seeMoreLink.textContent = 'See more';
//         }
//     }

//     document.addEventListener("DOMContentLoaded", function() {
//         const profileLink = document.getElementById("profileLink");
        
//         // Check if the user is logged in
//         const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        
//         // Update the profile link based on login status
//         if (isLoggedIn) {
//         profileLink.href = "subscriber.html"; // If logged in, go to profile
//         } else {
//         profileLink.href = "login.html"; // If not logged in, go to login
//         }
//         });
        
//         document.addEventListener("DOMContentLoaded", function () {
//             loadRecentRequest();
//             const profileLink = document.getElementById("profileLink");
//             // Check if the user is logged in
//             const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
//             // Update the profile link based on login status
//             if (isLoggedIn) {
//                 profileLink.href = "subscriber.html"; // If logged in, go to profile
//             } else {
//                 profileLink.href = "login.html"; // If not logged in, go to login
//             }
//         });
        
//         function loadRecentRequest() {
//             let loggedInMobile = sessionStorage.getItem("mobileNumber"); // Assuming loggedInMobile is stored in session storage
//             let requests = JSON.parse(localStorage.getItem("supportTickets")) || [];
//             let recentRequestDiv = document.getElementById("recentRequest");
        
//             if (requests.length > 0) {
//                 let userRequests = requests.filter(req => req.mobile === loggedInMobile);
//                 if (userRequests.length > 0) {
//                     let lastRequest = userRequests[userRequests.length - 1]; // Get most recent request
//                     recentRequestDiv.innerHTML = `
//                         <div class="d-flex justify-content-between align-items-center">
//                         <h6>ID: ${lastRequest.id}</h6>
//                         <span class="badge bg-${lastRequest.status === 'Open' ? 'primary' : lastRequest.status === 'Pending' ? 'warning' : 'success'}">${lastRequest.status}</span>
//                     </div>
//                     <p class="text-muted">Subject: ${lastRequest.subject}</p>
//                     <p>${new Date(lastRequest.timestamp).toLocaleString()}</p>
//                     `;
//                 }
//             }
//         }
        
//         function openRequestsModal() {
//             const modal = new bootstrap.Modal(document.getElementById("requestsModal"));
//             modal.show();
//             loadAllRequests();
//         }
        
//         function loadAllRequests() {
//             let loggedInMobile = sessionStorage.getItem("mobileNumber"); // Assuming loggedInMobile is stored in session storage
//             let requests = JSON.parse(localStorage.getItem("supportTickets")) || [];
//             let requestsDiv = document.getElementById("allRequests");
//             requestsDiv.innerHTML = ""; // Clear previous content
        
//             if (requests.length === 0) {
//                 requestsDiv.innerHTML = "<p>No support requests found.</p>";
//                 return;
//             }
        
//             let userRequests = requests.filter(req => req.mobile === loggedInMobile);
//             if (userRequests.length === 0) {
//                 requestsDiv.innerHTML = "<p>No support requests found.</p>";
//                 return;
//             }
        
//             userRequests.forEach((req, index) => {
//                 let requestCard = document.createElement("div");
//                 requestCard.classList.add("card", "shadow", "p-3", "mb-3");
//                 requestCard.innerHTML = `
//                     <div class="d-flex justify-content-between align-items-center">
//                         <h5>${req.subject}</h5>
//                         <span class="badge bg-${req.status === 'Open' ? 'primary' : req.status === 'Pending' ? 'warning' : 'success'}">${req.status}</span>
//                     </div>
//                     <p class="text-muted small">ID: ${req.id}</p>
//                     <p><strong>Date:</strong> ${new Date(req.timestamp).toLocaleString()}</p>
//                     <p><strong>User:</strong> ${req.user}</p>
//                     <p><strong>Priority:</strong> <span class="badge bg-${req.priority === 'High' ? 'danger' : req.priority === 'Medium' ? 'warning' : 'success'}">${req.priority}</span></p>
//                     <p><strong>Query:</strong> ${req.query}</p>
//                 `;
//                 requestsDiv.appendChild(requestCard);
//             });
//         }
        
// // Get the button
// var scrollToTopBtn = document.getElementById("scrollToTopBtn");

// // Show the button when scrolling down
// window.onscroll = function() {
//     if (document.documentElement.scrollTop > 400 || document.body.scrollTop > 400) {
//         scrollToTopBtn.style.display = "block";
//     } else {
//         scrollToTopBtn.style.display = "none";
//     }
// };

// // Scroll to top when clicked
// function scrollToTop() {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
// }


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

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.querySelector(".form-fill");
        const successModal = new bootstrap.Modal(document.getElementById("successModal"));
        const closeModalBtns = document.querySelectorAll('[data-bs-dismiss="modal"]');
    
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevents page refresh
            submitSupportTicket();
        });
    
        closeModalBtns.forEach(button => {
            button.addEventListener("click", function () {
                successModal.hide();
            });
        });
    
        // ✅ Load Recent Requests on Page Load
        loadRecentRequest();
    });

    // ✅ Submit Support Ticket via API
function submitSupportTicket() {
    const token = sessionStorage.getItem("userToken");
    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const supportRequest = {
        userId: document.getElementById("name").value;
        issueType: document.getElementById("subject").value,
        issueDescription: document.getElementById("query").value,
        priority: "Medium", // Default priority
        status: "Open"
    };

    fetch("http://localhost:8083/api/support-tickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(supportRequest)
    })
    .then(response => {
        if (!response.ok) throw new Error("❌ Failed to submit ticket.");
        return response.json();
    })
    .then(data => {
        console.log("✅ Ticket Submitted:", data);
        successModal.show();
        document.querySelector(".form-fill").reset(); // Reset form
        loadRecentRequest(); // Refresh recent request
    })
    .catch(error => {
        console.error("❌ Error submitting ticket:", error);
        alert("❌ Ticket submission failed.");
    });
}

// ✅ Load Recent Request from Backend
function loadRecentRequest() {
    const token = sessionStorage.getItem("userToken");
    if (!token) return;

    const userId = sessionStorage.getItem("userId");
    fetch(`http://localhost:8083/api/support-tickets/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(tickets => {
        if (tickets.length === 0) {
            document.getElementById("recentRequest").innerHTML = "<p>No recent requests.</p>";
            return;
        }

        const lastRequest = tickets[tickets.length - 1]; // Get the latest request
        document.getElementById("recentRequest").innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h6>ID: ${lastRequest.ticketId}</h6>
                <span class="badge bg-${lastRequest.status === 'open' ? 'primary' : lastRequest.status === 'pending' ? 'warning' : 'success'}">${lastRequest.status}</span>
            </div>
            <p class="text-muted">Subject: ${lastRequest.issueType}</p>
            <p>${new Date(lastRequest.createdAt).toLocaleString()}</p>
        `;
    })
    .catch(error => console.error("❌ Error fetching recent request:", error));
}

// ✅ Open and Load All Support Requests
function openRequestsModal() {
    const modal = new bootstrap.Modal(document.getElementById("requestsModal"));
    modal.show();
    loadAllRequests();
}

function loadAllRequests() {
    const token = sessionStorage.getItem("userToken");
    if (!token) return;

    const userId = sessionStorage.getItem("userId");
    fetch(`http://localhost:8083/api/support-tickets/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(tickets => {
        const requestsDiv = document.getElementById("allRequests");
        requestsDiv.innerHTML = ""; // Clear previous content

        if (tickets.length === 0) {
            requestsDiv.innerHTML = "<p>No support requests found.</p>";
            return;
        }

        tickets.forEach(ticket => {
            let requestCard = document.createElement("div");
            requestCard.classList.add("card", "shadow", "p-3", "mb-3");
            requestCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <h5>${ticket.issueType}</h5>
                    <span class="badge bg-${ticket.status === 'open' ? 'primary' : ticket.status === 'pending' ? 'warning' : 'success'}">${ticket.status}</span>
                </div>
                <p class="text-muted small">ID: ${ticket.ticketId}</p>
                <p><strong>Date:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
                <p><strong>Priority:</strong> <span class="badge bg-${ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'success'}">${ticket.priority}</span></p>
                <p><strong>Query:</strong> ${ticket.issueDescription}</p>
            `;
            requestsDiv.appendChild(requestCard);
        });
    })
    .catch(error => console.error("❌ Error fetching support requests:", error));
}

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