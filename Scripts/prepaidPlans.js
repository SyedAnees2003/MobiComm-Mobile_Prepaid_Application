let lastScrollTop = 0;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop) {
        // Scrolling down → Hide navbar
        navbar.style.top = "-94px"; // Adjust based on navbar height
    } else {
        // Scrolling up → Show navbar
        navbar.style.top = "0";
    }

    lastScrollTop = currentScroll;
});


document.getElementById("Offers").addEventListener("click", function() {
alert("No offers available at the moment.");
});

document.getElementById("recharge").addEventListener("click", function() {
window.location.href='payment.html';
});

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


// Plan data
const plans = {
    popular: [
        { price: "₹150", data: "1GB/day", sms: "50 SMS", calls: "200 mins", validity: "28 Days" },
        { price: "₹250", data: "2GB/day", sms: "150 SMS", calls: "Unlimited", validity: "28 Days" },
        { price: "₹199", data: "1GB/day", sms: "100 SMS", calls: "Unlimited", validity: "28 Days" },
        { price: "₹349", data: "4GB/day", sms: "200 SMS", calls: "Unlimited", validity: "28 Days" }
    ],
    data: [
        { price: "₹199", data: "3GB/day", sms: "Data only", calls: "Data only", validity: "28 Days" },
        { price: "₹299", data: "5GB/day", sms: "Data only", calls: "Data only", validity: "28 Days" }
    ],
    topup: [
        { price: "₹100", data: "1GB/day", sms: "50 SMS", calls: "Unlimited", validity: "5 Days" },
        { price: "₹200", data: "3GB/day", sms: "50 SMS", calls: "Unlimited", validity: "5 Days" }
    ],
    calls: [
        { price: "₹200", data: "No data", sms: "50 SMS", calls: "Unlimited", validity: "28 Days" },
        { price: "₹300", data: "5 GB", sms: "50 SMS", calls: "Unlimited", validity: "28 Days" }
    ],
    unlimited: [
        { price: "₹299", data: "3GB/day", sms: "50 SMS", calls: "Unlimited", validity: "28 Days" },
        { price: "₹799", data: "Unlimited data", sms: "Unlimited SMS", calls: "Unlimited calls", validity: "56 Days" }
    ]
};
// Function to create a plan card
function createPlanCard(plan, category) {
    return `
        <div class="col-md-6 mb-md-4">
            <div class="card p-3 shadow" data-price="${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}" data-category="${category}" data-validity = "${plan.validity}">
                <div class="card-body">
                    <div class="row first-row">
                        <p class="price text-center fw-bold fs-4">${plan.price}</p>
                    </div>
                    <div class="row text-center d-flex flex-md-row flex-column">
                        <div class="col d-flex flex-column align-items-center">
                            <p class="fw-bold text-muted mb-0">${plan.data}</p>
                            <p class="text-muted small">Data</p>
                        </div>
                        <div class="col d-flex flex-column align-items-center">
                            <p class="fw-bold text-muted mb-0">${plan.sms}</p>
                            <p class="text-muted small">SMS</p>
                        </div>
                        <div class="col d-flex flex-column align-items-center">
                            <p class="fw-bold text-muted mb-0">${plan.calls}</p>
                            <p class="text-muted small">Calls</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col d-flex flex-column align-items-center">
                            <p class="fw-bold text-muted mb-0">${plan.validity}</p>
                            <p class="text-muted small">Validity</p>
                        </div>
                        <div class="col d-flex flex-column align-items-center">
                            <p class="fw-bold text-muted mb-0">Netflix</p>
                            <p class="text-muted small">Benefits</p>
                        </div>
                    </div>
                    <div class="row text-center mt-2 mb-0">
                        <button class="btn btn-primary w-50 mx-auto" id="rechargeButton">Recharge</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to populate plans for a specific category
function populatePlans(category, plans) {
    const container = document.getElementById(`pills-${category}`).querySelector('.row');
    container.innerHTML = ''; // Clear existing content
    plans.forEach(plan => {
        container.innerHTML += createPlanCard(plan, category);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Populate all plans
    Object.keys(plans).forEach(category => {
        populatePlans(category, plans[category]);
    });

    // Event delegation for Recharge buttons
    const planContainers = document.querySelectorAll('.tab-pane .row');
    planContainers.forEach(container => {
        container.addEventListener('click', function (event) {
            if (event.target && event.target.id === 'rechargeButton') {
                const card = event.target.closest('.card');
                const price = card.getAttribute('data-price');
                const data = card.getAttribute('data-data');
                const sms = card.getAttribute('data-sms');
                const calls = card.getAttribute('data-calls');
                const category = card.getAttribute('data-category'); // Capture category
                const validity = card.getAttribute('data-validity')

                // Store plan details in localStorage
                localStorage.setItem('planPrice', price);
                localStorage.setItem('planData', data);
                localStorage.setItem('planSms', sms);
                localStorage.setItem('planCalls', calls);
                localStorage.setItem('planCategory', category); // Store category
                localStorage.setItem('planValidity',validity);

                // Update modal content
                document.getElementById('modalPrice').textContent = `Price: ${price}`;
                document.getElementById('modalData').textContent = `Data: ${data}`;
                document.getElementById('modalSms').textContent = `SMS: ${sms}`;
                document.getElementById('modalCalls').textContent = `Calls: ${calls}`;
                document.getElementById('modalCategory').textContent = `Category: ${category}`; // Update modal

                // Check if the user is logged in
                const token = sessionStorage.getItem('rechargeToken') === 'true';
                
                if (token) {
                    const modal = new bootstrap.Modal(document.getElementById('planDetailsModal'));
                    modal.show();
                    sessionStorage.setItem('rechargeToken', 'false');
                    return;
                } 

                const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

                if (!isLoggedIn) {
                    // If not logged in, display a popup message
                    event.preventDefault(); // Prevent the default action
                    showPopupMessage('Log in to proceed. Redirecting to Login page...');
                } else {
                    // If logged in, proceed with the normal functionality
                    const modal = new bootstrap.Modal(document.getElementById('planDetailsModal'));
                    modal.show();
                }
            }
        });
    });

    function showPopupMessage(message) {
        // Create the popup element
        const popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.innerText = message;
        
        // Style the popup element
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.padding = '40px';
        popup.style.backgroundColor = 'rgba(0,0,0,0.7)';
        popup.style.color = 'white';
        popup.style.borderRadius = '5px';
        popup.style.zIndex = '1000';
        popup.style.textAlign = 'center';
        
        // Append the popup to the body
        document.body.appendChild(popup);
        
        // Remove the popup after 3 seconds and redirect to the login page
        setTimeout(() => {
        document.body.removeChild(popup);
        window.location.href = 'login.html'; // Replace with your login page URL
        }, 3000);
        }

    const modalElement = document.getElementById('planDetailsModal');
    modalElement.addEventListener('hidden.bs.modal', () => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        document.body.style.overflow = ''; // Reset overflow property
        document.body.style.paddingRight = ''; // Remove extra padding (added for scrollbar)
    });
});
