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

            const token = generateToken();
            // Create a support request object
        const supportRequest = {
            id: token,
            user: document.getElementById("name").value,
            email: document.getElementById("email").value,
            mobile: document.getElementById("mobile").value,
            subject: document.getElementById("subject").value,
            query: document.getElementById("query").value,
            priority: "Medium", // Default priority
            status: "Pending", // Default status
            timestamp: new Date().toISOString() // Add timestamp
        };

        // Save the support request to localStorage
        saveSupportRequest(supportRequest);
    
        successModal.show(); // Show the modal
        form.reset(); // Reset form after submission
    });

    // Optional: Manually close modal on clicking OK or Close button
    closeModalBtns.forEach(button => {
        button.addEventListener("click", function () {
            successModal.hide();
        });
    });
    });

    function generateToken() {
        return 'T' + Math.random().toString(36).substr(2, 9).toUpperCase(); // Example: TABC123XYZ
    }

    function saveSupportRequest(request) {
        // Retrieve existing support requests from localStorage
        let supportRequests = JSON.parse(localStorage.getItem("supportTickets")) || [];
    
        // Add the new request
        supportRequests.push(request);
    
        // Save back to localStorage
        localStorage.setItem("supportTickets", JSON.stringify(supportRequests));

        console.log(localStorage.getItem("supportTickets"));
    }


     // Function to show/hide sections
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

    // Function to show more FAQs
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

    document.addEventListener("DOMContentLoaded", function() {
        const profileLink = document.getElementById("profileLink");
        
        // Check if the user is logged in
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        
        // Update the profile link based on login status
        if (isLoggedIn) {
        profileLink.href = "subscriber.html"; // If logged in, go to profile
        } else {
        profileLink.href = "login.html"; // If not logged in, go to login
        }
        });
    