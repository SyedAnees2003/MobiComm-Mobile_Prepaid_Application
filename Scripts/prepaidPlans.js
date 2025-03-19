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
});


document.getElementById("Offers").addEventListener("click", ()=>{
    alert("No offers available at the moment.");
});

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


// Load categories first when the page loads
document.addEventListener("DOMContentLoaded", function () {
    fetchCategories();  
});

// Fetch categories first, then fetch plans
function fetchCategories() {
    fetch("http://localhost:8083/api/categories")
        .then(response => response.json())
        .then(categories => {
            populateCategories(categories);
            fetchPlans();  // Fetch plans after categories load
        })
        .catch(error => console.error("❌ Error fetching categories:", error));
}

// Fetch plans from API
function fetchPlans() {
    fetch("http://localhost:8083/api/plans")
        .then(response => response.json())
        .then(plans => {
            console.log("✅ Active Plans fetched:", plans);

            // Ensure categoryId is set properly for each plan
            plans.forEach(plan => {
                if (!plan.categoryId && plan.category) {
                    plan.categoryId = plan.category.categoryId; // Extract categoryId
                }
            });

            populatePlans(plans);
        })
        .catch(error => console.error("❌ Error fetching plans:", error));
}

// Populate Categories in Nav Pills
function populateCategories(categories) {
    console.log("✅ Categories received:", categories);

    const navPills = document.getElementById("pills-tab");
    const tabContent = document.getElementById("pills-tabContent");

    navPills.innerHTML = ""; // Clear existing categories
    tabContent.innerHTML = ""; // Clear existing content

    categories.forEach((category, index) => {
        let activeClass = index === 0 ? "active" : "";
        let categoryId = `pills-${category.categoryId}`;

        // Create navigation tab
        navPills.innerHTML += `
            <button class="nav-link ${activeClass}" data-bs-toggle="pill" data-bs-target="#${categoryId}" id="${categoryId}-tab">
                ${category.categoryName}
            </button>
        `;

        // Create tab content container
        tabContent.innerHTML += `
            <div class="tab-pane fade ${activeClass === "active" ? "show active" : ""}" id="${categoryId}" role="tabpanel">
                <div class="row g-3"></div> <!-- This row will hold the plans -->
            </div>
        `;
    });

    console.log("✅ Categories populated successfully.");
}

// Populate Plans under respective categories
function populatePlans(plans) {
    plans.forEach(plan => {
        let benefits = "{}";
        try {
            benefits = JSON.parse(plan.additionalBenefits || "{}");
        } catch (e) {
            console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
        }

        let benefitsHtml = benefits.OTT ? getOttIcons(benefits, plan.validityDays) : "";

        const categoryDiv = document.getElementById(`pills-${plan.categoryId}`);
        if (!categoryDiv) {
            console.warn(`Category div not found for categoryId: ${plan.categoryId}`);
            return;
        }

        const planHTML = `
            <div class="feature-card card p-3 mt-4" data-price="₹${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}">
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
                    ${benefitsHtml} 
                </div>
                <div class="row text-center mt-3">
                    <button class="btn btn-primary w-50 mx-auto" onclick="showPlanDetails(${plan.planId})">Recharge</button>
                </div>
            </div>
        `;

        // Append the plan inside the correct category
        categoryDiv.querySelector(".row").innerHTML += planHTML;
    });

    console.log("✅ Plans populated successfully.");
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