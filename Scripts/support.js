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
    
            event.preventDefault(); // Prevent page refresh
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
    