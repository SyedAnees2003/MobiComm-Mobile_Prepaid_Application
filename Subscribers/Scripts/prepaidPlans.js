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
// Function to create the OTT benefit section with expandable details
function getOttIcons(benefits, validity) {
    // console.log("OTT Benefits:", benefits);

    if (!benefits || !Array.isArray(benefits)) return ""; // Ensure benefits is an array

    let icons = benefits.map(benefit => {
        let ottName = ""; 

        // Case 1: If benefit is a string (direct OTT name)
        if (typeof benefit === "string") {
            ottName = benefit;
        } 
        // Case 2: If benefit is an object containing OTT
        else if (typeof benefit === "object" && benefit.OTT) {
            ottName = benefit.OTT;
        }

        console.log("Processed OTT:", ottName);

        const iconPath = ottIcons[ottName] || ""; // Get corresponding icon

        return iconPath ? `<img src="${iconPath}" alt="${ottName}" class="ott-icon mx-2" width="30px">` : ottName;
    }).join("");

    if(icons){

        return `
            <div class="col d-flex flex-column align-items-center">
                <div class="d-flex flex-row align-items-center ott-icons">
                    ${icons}
                    <span class="arrow-toggle ms-2" onclick='toggleBenefits(this, ${JSON.stringify(benefits)}, ${validity})'>▶</span>
                </div>
                <p class="text-muted small mt-1">Benefits</p>
            </div>`;
    }
    else{
        return ``;
    }
}


// Function to show the benefits popup in a structured format
function openBenefitsPopup(element, benefits, validity) {
    let popup = document.getElementById("benefitsModal");
    let contentDiv = document.getElementById("benefitsContent");

    if (!benefits || !Array.isArray(benefits)) return; // Ensure benefits is an array

    // Generate each OTT benefit in a separate row
    let rowsHtml = benefits.map(benefit => {
        let ottName = "";

        // Case 1: If benefit is a string (direct OTT name)
        if (typeof benefit === "string") {
            ottName = benefit;
        } 
        // Case 2: If benefit is an object containing OTT
        else if (typeof benefit === "object" && benefit.OTT) {
            ottName = benefit.OTT;
        }

        const iconPath = ottIcons[ottName] || "";
        const extraText = benefit.Extras ? benefit.Extras : "No extra benefit"; 
        
        
        return `
            <div class="d-flex align-items-center justify-content-between benefit-row">
                <div class="ott-icon-container">
                    <img src="${iconPath}" alt="${ottName}" class="ott-icon" width="30px">
                </div>
                <p class="benefit-text mb-0">${extraText}</p>
                <p class="benefit-validity mb-0">Validity: ${validity} Days</p>
            </div>
        `;
    }).join("");

    contentDiv.innerHTML = rowsHtml;

    // Get element position
    let rect = element.getBoundingClientRect();
    let popupWidth = popup.offsetWidth || 300; // Default width if not calculated
    let popupHeight = popup.offsetHeight || 200;
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    // ** Position Modal Below the Arrow **
    let leftPos = window.scrollX + rect.left + rect.width / 2 - popupWidth / 2;
    let topPos = window.scrollY + rect.bottom + 8; // 8px margin below the arrow

    // ** Prevent Overflow (Right & Left) **
    if (leftPos + popupWidth >= screenWidth) {
        leftPos = screenWidth - popupWidth - 10; // Shift left
    }
    if (leftPos < 10) {
        leftPos = 10; // Shift right
    }

    // ** Prevent Overflow (Bottom) - Move Above Arrow if Needed **
    if (topPos + popupHeight > screenHeight) {
        topPos = window.scrollY + rect.top + 30; // Move above arrow
    }

    // ** Apply Position to Popup **
    popup.style.left = `${leftPos}px`;
    popup.style.top = `${topPos}px`;
    popup.style.opacity = "1";
    popup.style.display = "block";
}

// Function to close the benefits popup
function closeBenefitsPopup() {
    let popup = document.getElementById("benefitsModal");
    popup.style.opacity = "0";
    setTimeout(() => {
        popup.style.display = "none";
    }, 300); // Matches CSS transition time
}

// Modify the arrow click function to open the popup
function toggleBenefits(element, benefits, validity) {
    let popup = document.getElementById("benefitsModal");

    // If the popup is already open, close it and reset the arrow
    if (popup.style.display === "block") {
        closeBenefitsPopup();
        element.textContent = "▶"; // Reset to right arrow when closing
    } else {
        openBenefitsPopup(element, benefits, validity);
        element.textContent = "▼"; // Change to down arrow when opening
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

        // Add filter pills dynamically below the categories
        document.getElementById("filter-pills").innerHTML = `
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="under299">Under ₹299</button>
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="under499">Under ₹499</button>
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="data">Data Plans</button>
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="calls">Calls</button>
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="ott">OTT Plans</button>
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="unlimited">Unlimited</button>
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="28days">28 Days</button>
        <button class="nav-link filter-pill opacity-30 small-button" data-filter="yearly">Yearly Plans</button>
        `;

        // Attach click event for filtering plans
        document.querySelectorAll(".filter-pill").forEach(button => {
            button.addEventListener("click", function () {
                toggleFilter(button);
            });
        });

    console.log("✅ Categories populated successfully.");
}

// Populate Plans under respective categories
function populatePlans(plans) {

    document.querySelectorAll(".tab-pane .row").forEach(row => row.innerHTML = "");

    plans.forEach(plan => {
        let benefits = "{}";
        try {
            benefits = JSON.parse(plan.additionalBenefits || "{}");
        } catch (e) {
            console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
    }

    // console.log("OTTs: ", benefits.OTT);
    
    let benefitsHtml = benefits.OTT ? getOttIcons(benefits.OTT, plan.validityDays) : "";
    
        const categoryDiv = document.getElementById(`pills-${plan.categoryId}`);
        if (!categoryDiv) {
            console.warn(`Category div not found for categoryId: ${plan.categoryId}`);
            return;
        }
        
        const planHTML = `
            <div class="feature-card card p-3 mt-2 plan-item" data-price="₹${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}" data-category="${plan.categoryId}" data-benefits='${JSON.stringify(benefits.OTT)}'>
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
                        <p class="fw-bold text-muted mb-0 validity">${plan.validityDays} Days</p>
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


function searchPlans() {
    let query = document.getElementById("searchInput").value.toLowerCase();

    fetch(`http://localhost:8083/api/plans/search?query=${query}`)
        .then(response => response.json())
        .then(plans => {
            console.log("🔍 Search Results:", plans);

            // If search is cleared, reload all plans in categories
            if (!query.trim()) {
                fetchPlans();  // Reload all plans from API
                return;
            }

            // Clear only the plans inside each category, keeping the categories intact
            document.querySelectorAll(".tab-pane .row").forEach(row => row.innerHTML = "");

            // Organize plans by category
            let categorizedPlans = {};
            plans.forEach(plan => {
                if (!categorizedPlans[plan.categoryId]) {
                    categorizedPlans[plan.categoryId] = [];
                }
                categorizedPlans[plan.categoryId].push(plan);
            });

            // Iterate through all category tabs
            document.querySelectorAll(".tab-pane").forEach(tabPane => {
                let categoryId = tabPane.id.replace("pills-", "");
                let categoryRow = tabPane.querySelector(".row");

                if (categorizedPlans[categoryId]) {
                    // Populate plans for this category
                    categorizedPlans[categoryId].forEach(plan => {
                        let benefits = "{}";
                        try {
                            benefits = JSON.parse(plan.additionalBenefits || "{}");
                        } catch (e) {
                            console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
                        }

                        let benefitsHtml = benefits.OTT ? getOttIcons(benefits.OTT, plan.validityDays) : "";

                        categoryRow.innerHTML += `
                            <div class="feature-card card p-3 mt-2 plan-item" data-price="₹${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}" data-category="${plan.categoryId}" data-benefits='${JSON.stringify(benefits.OTT)}'>
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
                                        <p class="fw-bold text-muted mb-0 validity">${plan.validityDays} Days</p>
                                        <p class="text-muted small">Validity</p>
                                    </div>
                                    ${benefitsHtml} 
                                </div>
                                <div class="row text-center mt-3">
                                    <button class="btn btn-primary w-50 mx-auto" onclick="showPlanDetails(${plan.planId})">Recharge</button>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    // If no matching plans found for this category, show a "No Plans Found" message
                    categoryRow.innerHTML = `<div class="alert alert-warning text-center">No plans found for "${query}"</div>`;
                }
            });

            console.log("✅ Search results categorized correctly.");
        })
        .catch(error => console.error("❌ Error fetching search results:", error));
}


function sortPlans(order) {
    fetch(`http://localhost:8083/api/plans/sort?order=${order}`)
        .then(response => response.json())
        .then(plans => {
            console.log("🔄 Sorted Plans:", plans);

            // Clear only the plans inside each category, keeping the categories intact
            document.querySelectorAll(".tab-pane .row").forEach(row => row.innerHTML = "");

            // Organize sorted plans by category
            let categorizedPlans = {};
            plans.forEach(plan => {
                if (!categorizedPlans[plan.categoryId]) {
                    categorizedPlans[plan.categoryId] = [];
                }
                categorizedPlans[plan.categoryId].push(plan);
            });

            // Iterate through all category tabs
            document.querySelectorAll(".tab-pane").forEach(tabPane => {
                let categoryId = tabPane.id.replace("pills-", "");
                let categoryRow = tabPane.querySelector(".row");

                if (categorizedPlans[categoryId]) {
                    // Populate plans for this category
                    categorizedPlans[categoryId].forEach(plan => {
                        let benefits = "{}";
                        try {
                            benefits = JSON.parse(plan.additionalBenefits || "{}");
                        } catch (e) {
                            console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
                        }

                        let benefitsHtml = benefits.OTT ? getOttIcons(benefits.OTT, plan.validityDays) : "";

                        categoryRow.innerHTML += `
                            <div class="feature-card card p-3 mt-2 plan-item" data-price="₹${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}" data-category="${plan.categoryId}" data-benefits='${JSON.stringify(benefits.OTT)}'>
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
                                        <p class="fw-bold text-muted mb-0 validity">${plan.validityDays} Days</p>
                                        <p class="text-muted small">Validity</p>
                                    </div>
                                    ${benefitsHtml} 
                                </div>
                                <div class="row text-center mt-3">
                                    <button class="btn btn-primary w-50 mx-auto" onclick="showPlanDetails(${plan.planId})">Recharge</button>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    // If no plans found for this category, show a "No Plans Found" message
                    categoryRow.innerHTML = `<div class="alert alert-warning text-center">No plans available</div>`;
                }
            });

            console.log("✅ Sorted plans categorized correctly.");
        })
        .catch(error => console.error("❌ Error sorting plans:", error));
}

// Function to toggle filter selection and apply filtering
function toggleFilter(button) {
    // Toggle active state for the clicked filter
    if (button.classList.contains("active")) {
        button.classList.remove("active", "opacity-30");
        button.classList.add("opacity-30");
    } else {
        button.classList.add("active", "opacity-30");
        button.classList.remove("opacity-30");
    }

    applyFilters(); // Apply filters when selection changes
}

function applyFilters() {
    let params = new URLSearchParams();

    // Add filters based on selected pills
    document.querySelectorAll(".filter-pill.active").forEach(activePill => {
        switch (activePill.dataset.filter) {
            case "under299":
                params.append("maxPrice", "299");
                break;
            case "under499":
                params.append("maxPrice", "499");
                break;
            case "data":
                params.append("dataOnly", "true");
                break;
            case "calls":
                params.append("callsOnly", "true");
                break;
            case "ott":
                params.append("ottOnly", "true");
                break;
            case "unlimited":
                params.append("unlimited", "true");
                break;
            case "28days":
                params.append("validity", "28");
                break;
            case "yearly":
                params.append("validity", "365");
                break;
        }
    });

    // Fetch filtered plans from backend
    fetch(`http://localhost:8083/api/plans/filter?${params.toString()}`)
        .then(response => response.json())
        .then(plans => {
            console.log("Filtered plans: ", plans);
            populatePlans(plans); // Update UI with filtered results
        })
        .catch(error => console.error("❌ Error filtering plans:", error));
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
            
            // ✅ Parse and extract OTT benefits correctly
            let benefits = [];
            try {
                const parsedBenefits = JSON.parse(plan.additionalBenefits || "[]"); // Ensure it's an array or object
                benefits = Array.isArray(parsedBenefits) ? parsedBenefits : parsedBenefits.OTT || [];
            } catch (e) {
                console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
            }

            console.log("Extracted OTT Benefits:", benefits);

            // ✅ Generate OTT Icons and Extras Text
            let benefitsHtml = "";
            if (benefits.length > 0) {
                benefitsHtml = benefits.map(benefit => {
                    let ottName = "";
                    let extraText = "";

                    // 🔹 Handle Case 1: Array of Strings
                    if (typeof benefit === "string") {
                        ottName = benefit;
                    } 
                    // 🔹 Handle Case 2: Array of Objects
                    else if (typeof benefit === "object" && benefit.OTT) {
                        ottName = benefit.OTT;
                        extraText = benefit.Extras ? `<span class="text-muted small"> - ${benefit.Extras}</span>` : "";
                    }

                    const iconPath = ottIcons[ottName] || ""; // Get corresponding icon

                    return iconPath
                        ? `<div class="d-flex align-items-center my-1">
                               <img src="${iconPath}" alt="${ottName}" class="ott-icon me-2" width="30px">
                               <span>${ottName}</span> ${extraText}
                           </div>`
                        : `<p>${ottName} ${extraText}</p>`; // Fallback if no icon found
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
    let benefits = "{}";
    try {
        benefits = JSON.parse(plan.additionalBenefits || "{}");
    } catch (e) {
        console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
    }

    // console.log("OTTs: ", benefits.OTT);

    let benefitsHtml = benefits.OTT ? getOttIcons(benefits.OTT, plan.validityDays) : "";

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
                    ${benefitsHtml} 
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