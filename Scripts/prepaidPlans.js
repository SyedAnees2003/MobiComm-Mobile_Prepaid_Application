// document.addEventListener('DOMContentLoaded', () => {
//     // Populate all plans
//     Object.keys(plans).forEach(category => {
//         populatePlans(category, plans[category]);
//     });

//     // Event delegation for Recharge buttons
//     const planContainers = document.querySelectorAll('.tab-pane .row');
//     planContainers.forEach(container => {
//         container.addEventListener('click', function (event) {
//             if (event.target && event.target.id === 'rechargeButton') {
//                 const card = event.target.closest('.card');
//                 const price = card.getAttribute('data-price');
//                 const data = card.getAttribute('data-data');
//                 const sms = card.getAttribute('data-sms');
//                 const calls = card.getAttribute('data-calls');
//                 const category = card.getAttribute('data-category'); // Capture category
//                 const validity = card.getAttribute('data-validity')

//                 // Store plan details in localStorage
//                 localStorage.setItem('planPrice', price);
//                 localStorage.setItem('planData', data);
//                 localStorage.setItem('planSms', sms);
//                 localStorage.setItem('planCalls', calls);
//                 localStorage.setItem('planCategory', category); // Store category
//                 localStorage.setItem('planValidity',validity);

//                 // Update modal content
//                 document.getElementById('modalPrice').textContent = `Price: ${price}`;
//                 document.getElementById('modalData').textContent = `Data: ${data}`;
//                 document.getElementById('modalSms').textContent = `SMS: ${sms}`;
//                 document.getElementById('modalCalls').textContent = `Calls: ${calls}`;
//                 document.getElementById('modalCategory').textContent = `Category: ${category}`; // Update modal

//                 // Check if the user is logged in
//                 const token = sessionStorage.getItem('rechargeToken') === 'true';
//                 console.log("token: ",token);
                
//                 if (token) {
//                     const modal = new bootstrap.Modal(document.getElementById('planDetailsModal'));
//                     modal.show();
//                     return;
//                 } 

//                 const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

//                 if (!isLoggedIn) {
//                     // If not logged in, display a popup message
//                     event.preventDefault(); // Prevent the default action
//                     showPopupMessage('Log in to proceed. Redirecting to Login page...');
//                 } else {
//                     // If logged in, proceed with the normal functionality
//                     const modal = new bootstrap.Modal(document.getElementById('planDetailsModal'));
//                     modal.show();
//                 }
//             }
//         });
//     });


document.addEventListener("DOMContentLoaded", function () {
    fetchPlans();

    // ✅ Profile Icon Click - Redirect based on authentication
    document.getElementById("profileLink").addEventListener("click", function (event) {
        event.preventDefault();
        const token = sessionStorage.getItem("userToken");

        if (!token) {
            alert("Please log in to proceed.");
            window.location.href = "login.html"; // Redirect to login if not authenticated
        } else {
            window.location.href = "subscriber.html"; // Redirect to profile page if authenticated
        }
    });
});

document.getElementById("Offers").addEventListener("click", ()=>{
    alert("No offers available at the moment.");
});

// Fetch plans from API
function fetchPlans() {
    fetch("http://localhost:8083/api/plans")
        .then(response => response.json())
        .then(plans => {
            console.log("Fetched plans:", plans); // Debugging
            if (plans.length === 0) {
                document.getElementById("pills-popular").querySelector(".row").innerHTML = "<p>No plans available.</p>";
            } else {
                populatePlans(plans);
            }
        })
        .catch(error => console.error("Error fetching plans:", error));
}

// OTT Image Mapping
const ottIcons = {
    "Netflix": "/Assets/Netflix.png",
    "Amazon Prime": "/Assets/AmazonPrimeVideo.png",
    "Disney+ Hotstar": "/Assets/JioHotstar.png",
    "Sony Liv": "/Assets/Sony_Liv.png"
};

function getOttIcons(benefits, validity) {
    if (!benefits || !benefits.OTT) return ""; // No benefits, return empty

    let icons = benefits.OTT.map(ott => {
        const iconPath = ottIcons[ott] || ""; // Get icon path
        return iconPath ? `<img src="${iconPath}" alt="${ott}" class="ott-icon" width="30px">` : ott;
    }).join("");

    return `
        <div class="col d-flex flex-column align-items-center">
            <div class="d-flex flex-row align-items-center ott-icons">
                ${icons}
                <span class="arrow-toggle ms-2" onclick='toggleBenefits(this, ${JSON.stringify(benefits)}, ${validity})'>▶</span>
            </div>
            <p class="text-muted small mt-1">Benefits</p>
        </div>`;
}

// Function to show the benefits popup near the clicked element
// Function to show the benefits popup in a structured format
function openBenefitsPopup(element, benefits, validity) {
    let popup = document.getElementById("benefitsModal");
    let contentDiv = document.getElementById("benefitsContent");

    if (!benefits || !benefits.OTT) return; // No benefits, do nothing

    // Generate each OTT benefit in a separate row
    let rowsHtml = benefits.OTT.map((ott, index) => {
        const iconPath = ottIcons[ott] || "";
        const extraText = benefits.Extras && benefits.Extras[index] ? benefits.Extras[index] : "No extra benefit"; // Match extra to OTT
        
        return `
            <div class="d-flex align-items-center justify-content-between benefit-row">
                <div class="ott-icon-container">
                    <img src="${iconPath}" alt="${ott}" class="ott-icon" width="30px">
                </div>
                <p class="benefit-text mb-0">${extraText}</p>
                <p class="benefit-validity mb-0">Validity: ${validity} Days</p>
            </div>
        `;
    }).join("");

    // Set popup content
    contentDiv.innerHTML = rowsHtml;

    // Get element position
    let rect = element.getBoundingClientRect();
    let popupWidth = 300; // Approximate width of the popup
    let screenWidth = window.innerWidth;

    let leftPos = window.scrollX + rect.left;
    let topPos = window.scrollY + rect.bottom + 10; // Position below the arrow

    // Adjust position if it overflows the right edge
    if (leftPos + popupWidth > screenWidth) {
        leftPos = screenWidth - popupWidth - 10; // Shift it left to stay inside the screen
    }

    // Adjust position if it overflows the left edge
    if (leftPos < 0) {
        leftPos = 10; // Move it slightly right to stay inside
    }

    // Apply final position
    popup.style.top = `${topPos}px`;
    popup.style.left = `${leftPos}px`;
    popup.style.display = "block";
}

// Function to close the benefits popup
function closeBenefitsPopup() {
    document.getElementById("benefitsModal").style.display = "none";
}

// Modify the arrow click function to open the popup
function toggleBenefits(element, benefits, validity) {
    let popup = document.getElementById("benefitsModal");

    // If the popup is already open, close it
    if (popup.style.display === "block") {
        closeBenefitsPopup();
    } else {
        openBenefitsPopup(element, benefits, validity);
    }
}

// Close popup if user clicks outside
document.addEventListener("click", function (event) {
    let popup = document.getElementById("benefitsModal");
    if (!popup.contains(event.target) && !event.target.classList.contains("arrow-toggle")) {
        closeBenefitsPopup();
    }
});


// Modify populatePlans() to use the new function
function populatePlans(plans) {
    const categories = {
        "1": "pills-popular",
        "2": "pills-data",
        "3": "pills-topup",
        "4": "pills-calls",
        "5": "pills-unlimited",
        "6": "pills-entertainment",
        "7": "pills-international"
    };

    plans.forEach(plan => {
        let benefits = "{}";
        try {
            benefits = JSON.parse(plan.additionalBenefits || "{}");
        } catch (e) {
            console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
        }

        let benefitsHtml = benefits.OTT ? getOttIcons(benefits, plan.validityDays) : "";

        const categoryDiv = document.getElementById(categories[plan.categoryId]);
        if (!categoryDiv) return; // Skip if category is missing

        const planHTML = `
            <div class="feature-card card p-3 mt-4" data-price="₹${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}" border-radius="10px">
                <div class="card-body">
                    <div class="row first-row">
                        <p class="price text-center fw-bold fs-4">₹${plan.price}</p>
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
                </div>
                <div class="row">
                    <div class="col d-flex flex-column align-items-center">
                        <p class="fw-bold text-muted mb-0">${plan.validityDays} Days</p>
                        <p class="text-muted small">Validity</p>
                    </div>
                    ${benefitsHtml} <!-- Only show benefits if available -->
                </div>
                <div class="row text-center mt-3">
                    <button class="btn btn-primary w-50 mx-auto" onclick="showPlanDetails(${plan.planId})">Recharge</button>
                </div>
            </div>
        `;

        categoryDiv.querySelector(".row").innerHTML += planHTML;
    });
}

// Function to fetch and display plan details in modal
function showPlanDetails(planId) {

    let token = sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken");

    if (!token) {
        showPopupMessage("Please log in to proceed with recharge. Re-Directing..");
        setTimeout(() => {
            window.location.href = "login.html"; // Redirect after showing message
        }, 2000);
        return;
    }

    fetch(`http://localhost:8083/api/plans/plan/${planId}`)
        .then(response => response.json())
        .then(plan => {
            document.getElementById('modalPrice').textContent = `Price: ₹${plan.price}`;
            document.getElementById('modalData').textContent = `Data: ${plan.data}`;
            document.getElementById('modalSms').textContent = `SMS: ${plan.sms}`;
            document.getElementById('modalCalls').textContent = `Calls: ${plan.calls}`;
            
            // Parse additional benefits JSON
            let benefits = {};
            try {
                benefits = JSON.parse(plan.additionalBenefits || "{}");
            } catch (e) {
                console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
            }

            // Generate OTT Benefits HTML
            let benefitsHtml = "";
            if (benefits.OTT) {
                benefitsHtml = benefits.OTT.map(ott => {
                    const iconPath = ottIcons[ott] || ""; // Get icon path
                    return iconPath 
                        ? `<div class="d-flex align-items-center">
                               <img src="${iconPath}" alt="${ott}" class="ott-icon me-2" width="20px">
                               <span>${ott}</span>
                           </div>` 
                        : `<p>Benefits: ${ott}</p>`; // Fallback if no icon
                }).join("");
            } else {
                benefitsHtml = "<p>No OTT benefits</p>";
            }

            document.getElementById("modalBenefits").innerHTML =`Benefits:  ${benefitsHtml}`;

            // Fetch category name using categoryId
            return fetch(`http://localhost:8083/api/categories/${plan.categoryId}`)
                .then(response => response.json())
                .then(category => {
                    document.getElementById('modalCategory').textContent = `Category: ${category.categoryName}`;
                })
                .catch(error => {
                    console.error("Error fetching category name:", error);
                    document.getElementById('modalCategory').textContent = `Category: Unknown`;
                });
        })
        .then(() => {
            const modal = new bootstrap.Modal(document.getElementById('planDetailsModal'));
            modal.show();
            document.getElementById("recharge").addEventListener("click", ()=> window.location.href = "payment.html");
            sessionStorage.setItem("selectedPlanId", planId);
        })

        .catch(error => console.error("Error fetching plan details:", error));
}

// Fetch and display "Featured for You" section
function fetchFeaturedPlans() {
    fetch("http://localhost:8083/api/plans")
        .then(response => response.json())
        .then(plans => {
            if (!plans || plans.length === 0) return;

            // Find one plan from "Popular" and one from "Entertainment"
            let popularPlan = plans.find(plan => plan.categoryId === 1);
            let entertainmentPlan = plans.find(plan => plan.categoryId === 6);

            let featuredHtml = "";

            if (popularPlan) {
                featuredHtml += createFeaturedCard(popularPlan);
            }
            if (entertainmentPlan) {
                featuredHtml += createFeaturedCard(entertainmentPlan);
            }

            document.querySelector(".featured-plans").innerHTML = featuredHtml;
        })
        .catch(error => console.error("Error fetching featured plans:", error));
}

// Function to create a "Featured Plan" card
function createFeaturedCard(plan) {
    let benefitsHtml = "";

    // Parse additional benefits JSON
    let benefits = {};
    try {
        benefits = JSON.parse(plan.additionalBenefits || "{}");
    } catch (e) {
        console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
    }

    if (benefits.OTT) {
        benefitsHtml =   benefits.OTT ? getOttIcons(benefits, plan.validityDays) : "";

    } else {
        benefitsHtml = "<p class='text-muted small'>No OTT benefits</p>";
    }

    return `
        <div class="feature-card card p-3" data-price="₹${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}">
            <div class="card-body">
                <div class="row first-row">
                    <p class="price text-center fw-bold fs-4">₹${plan.price}</p>
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
            </div>
            <div class="row">
                <div class="col d-flex flex-column align-items-center">
                    <p class="fw-bold text-muted mb-0">${plan.validityDays} Days</p>
                    <p class="text-muted small">Validity</p>
                </div>
                <div class="col d-flex flex-column align-items-center">
                    ${benefitsHtml}
                </div>                        
            </div>
            <div class="row text-center mt-3">
                <button class="btn btn-primary w-50 mx-auto" onclick="showPlanDetails(${plan.planId})">Recharge</button>
            </div>
        </div>`;
}

// Call function on page load
document.addEventListener("DOMContentLoaded", fetchFeaturedPlans);

// Show popup message
function showPopupMessage(message) {
    const popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.innerText = message;

    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.backgroundColor = 'rgba(0,0,0,0.8)';
    popup.style.color = 'white';
    popup.style.borderRadius = '5px';
    popup.style.zIndex = '1000';
    popup.style.textAlign = 'center';

    document.body.appendChild(popup);

    setTimeout(() => {
        document.body.removeChild(popup);
    }, 3000);
}

// Hide/show navbar on scroll
let lastScrollTop = 0;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop) {
        navbar.style.top = "-94px";
    } else {
        navbar.style.top = "0";
    }

    lastScrollTop = currentScroll;
});

// Scroll to top button
var scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.onscroll = function () {
    if (document.documentElement.scrollTop > 400 || document.body.scrollTop > 400) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}