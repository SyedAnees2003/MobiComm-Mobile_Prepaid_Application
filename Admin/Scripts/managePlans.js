// ✅ Call the function on page load
document.addEventListener("DOMContentLoaded", function () {
    populateCategoryPlansTable();
    loadPlanSummary();
});

// ✅ Fetch Category-Wise Plan Details
function loadPlanSummary() {
    const token = sessionStorage.getItem("adminToken");

    if(!token){
        // alert("No session available!");
        window.location.href="login.html";
    }

    fetch("http://localhost:8083/api/plans/category-wise-details", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })        
    .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch category-wise data.");
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ Category-wise Data:", data);

            // ✅ Total Categories Count
            let totalCategories = data.length;
            document.querySelector(".plan-cards .card-item-top:nth-child(1) h2").textContent = totalCategories.toString().padStart(2, '0');

            // ✅ Total Plans Count
            let totalPlans = data.reduce((sum, category) => sum + category.totalPlans, 0);
            document.querySelector(".plan-cards .card-item-top:nth-child(2) h2").textContent = totalPlans + "+";

            // ✅ Total Subscribers
            let totalSubscribers = data.reduce((sum, category) => sum + category.activeSubscribers, 0);
            document.querySelector(".plan-cards .card-item-top:nth-child(3) h2").textContent = totalSubscribers + "+";

            // ✅ Most Popular Category (Highest Subscribers)
            let popularCategory = data.reduce((max, category) => (category.activeSubscribers > max.activeSubscribers ? category : max), data[0]);
            document.querySelector(".plan-cards .card-item-top:nth-child(4) h2").textContent = popularCategory.categoryName;
        })
        .catch(error => {
            console.error("❌ Error loading plan summary:", error);
        });
}

// ✅ Function to Fetch & Populate Category-wise Plan Details
function populateCategoryPlansTable() {
    const token = sessionStorage.getItem("adminToken");
    
    if (!token) {
        // alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:8083/api/plans/category-wise-details", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error("❌ Failed to fetch category-wise details.");
        return response.json();
    })
    .then(categories => {
        console.log("✅ Category Data Fetched:", categories);

        const table = document.getElementById("categoryPlansTable");
        const tableHead = table.querySelector("thead");
        const tableBody = table.querySelector("tbody");

        if (!table || !tableHead || !tableBody) {
            console.error("❌ Table elements not found.");
            return;
        }

        // ✅ Clear existing content
        tableHead.innerHTML = `
            <tr>
                <th>Category</th>
                <th>Total Plans</th>
                <th>Active Subscribers</th>
                <th>Revenue Generated (₹)</th>
            </tr>
        `;
        tableBody.innerHTML = "";

        // ✅ Populate Table Body Dynamically
        categories.forEach(category => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category.categoryName || "N/A"}</td>
                <td>${category.totalPlans || 0}</td>
                <td>${category.activeSubscribers || 0}</td>
                <td>₹${category.revenueGenerated || 0}</td>
            `;
            tableBody.appendChild(row);
        });

        // ✅ Reinitialize DataTable
        if ($.fn.DataTable.isDataTable("#categoryPlansTable")) {
            $("#categoryPlansTable").DataTable().destroy();
        }

        $("#categoryPlansTable").DataTable({
            paging: true,
            pageLength: 5,
            lengthMenu: [5, 10, 20],
            searching: true,
            ordering: true,
            autoWidth: false,
            responsive: true
        });

    })
    .catch(error => {
        console.error("❌ Error fetching category-wise plans:", error);
    });
}



// Stack for undo functionality
let undoStack = [];

let categoryMap = {};


document.addEventListener("DOMContentLoaded", function () {
    fetchCategories();  // Load categories on page load
});

// Fetch categories first, then fetch plans
function fetchCategories() {
    fetch("http://localhost:8083/api/categories")
        .then(response => response.json())
        .then(categories => {
            populateCategories(categories);
            fetchPlans(categories);  // Fetch plans after categories load
        })
        .catch(error => console.error("❌ Error fetching categories:", error));
}

function fetchPlans() {
    fetch("http://localhost:8083/api/plans")
        .then(response => response.json())
        .then(plans => {
            console.log("Active Plans fetched from API:", plans);

            plans.forEach(plan => {
                if (!plan.categoryId && plan.category) {
                    plan.categoryId = plan.category.categoryId; // Extract categoryId
                }
            });

            populatePlans(plans);
        })
        .catch(error => console.error("❌ Error fetching plans:", error));

            // Fetch Inactive Plans
        fetch("http://localhost:8083/api/plans/inactive")
        .then(response => response.json())
        .then(inactivePlans => {
            console.log("✅ Inactive Plans:", inactivePlans);
            populateInactivePlans(inactivePlans);
        })
        .catch(error => console.error("❌ Error fetching inactive plans:", error));
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

        // console.log("Category id: ", category.categoryId);

        // Create navigation tab
        navPills.innerHTML += `
            <button class="nav-link ${activeClass}" data-bs-toggle="pill" data-bs-target="#${categoryId}" id="${categoryId}-tab">
                ${category.categoryName}
            </button>
        `;

        // Create tab content container
        tabContent.innerHTML += `
            <div class="tab-pane fade ${activeClass === "active" ? "show active" : ""}" id="${categoryId}" role="tabpanel">
                <div class="row g-3"></div>
            </div>
        `;
    });

    // setTimeout(() => {
    //     console.log("Calling sortPlans...");
    //     sortPlans("asc"); // or "desc" based on default sorting order
    // }, 500);

    console.log("✅ Categories populated successfully.");
}

// Populate Inactive Plans
function populateInactivePlans(inactivePlans) {
    const inactiveContainer = document.getElementById("inactive-plans-list");

    if (!inactiveContainer) {
        console.error("❌ Inactive plans container not found!");
        return;
    }

    inactiveContainer.innerHTML = ""; // Clear previous data

    let rowDiv = document.createElement("div");
    rowDiv.classList.add("d-flex","row", "gx-3", "gy-4"); // Adds spacing between columns

    inactivePlans.forEach((plan, index) => {
        let colDiv = document.createElement("div");
        colDiv.classList.add("col-12", "col-sm-6", "col-lg-4"); // 1 per row on mobile, 2 on sm, 3 on lg
        colDiv.innerHTML = createPlanCard(plan);

        rowDiv.appendChild(colDiv);
    });

    inactiveContainer.appendChild(rowDiv);
}


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
        return `
        `
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


// **Create Plan Cards**
function createPlanCard(plan) {
    let benefits = "{}";
    try {
        benefits = JSON.parse(plan.additionalBenefits || "{}");
    } catch (e) {
        console.warn("Invalid JSON in additionalBenefits:", plan.additionalBenefits);
    }

    // console.log("OTTs: ", benefits.OTT);

    let benefitsHtml = benefits.OTT ? getOttIcons(benefits.OTT, plan.validityDays) : "";

    return `
        <div class="feature-card card p-3 mt-4 plan-item" data-price="₹${plan.price}" data-data="${plan.data}" data-sms="${plan.sms}" data-calls="${plan.calls}" data-category="${plan.categoryId}" border-radius="10px">
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
                    <button class="btn btn-primary w-50 mx-auto" onclick="showPlanDetails(${plan.planId})">View</button>
                </div>
                <div class="card-footer text-center mt-2 d-flex">
                    <button class="btn btn-primary updateBtn btn-sm me-2" onclick="editPlan(${plan.planId})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger deleteBtn btn-sm" onclick="deletePlan(${plan.planId})"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
}

// Populate Plans in Correct Categories
function populatePlans(plans) {
    console.log("✅ Plans received:", plans);

    plans.forEach(plan => {
        if (!plan.categoryId) {
            console.warn(`⚠️ Missing categoryId for plan: ${plan.planId} - ${plan.planName}`);
            return;
        }

        let categoryContainerId = `pills-${plan.categoryId}`;
        let categoryDiv = document.getElementById(categoryContainerId);

        if (!categoryDiv) {
            console.warn(`⚠️ Category container not found for categoryId ${plan.categoryId}`);
            return;
        }

        let planRow = categoryDiv.querySelector(".row");
        if (!planRow) {
            console.warn(`⚠️ Row container missing inside category ${plan.categoryId}`);
            return;
        }

        planRow.innerHTML += createPlanCard(plan);
    });

    console.log("✅ Plans populated successfully.");
}


// 🔍 Search Plans by Price, Data, SMS, or Calls
function searchPlans() {
    let query = document.getElementById("searchInput").value.toLowerCase();

    document.querySelectorAll(".plan-item").forEach(plan => {
        let price = plan.getAttribute("data-price").toLowerCase();
        let data = plan.getAttribute("data-data").toLowerCase();
        let sms = plan.getAttribute("data-sms").toLowerCase();
        let calls = plan.getAttribute("data-calls").toLowerCase();

        if (price.includes(query) || data.includes(query) || sms.includes(query) || calls.includes(query)) {
            plan.style.display = "block";
        } else {
            plan.style.display = "none";
        }
    });
}

// 🔽 Sort Plans by Price
function sortPlans(order) {
    let plansArray = Array.from(document.querySelectorAll(".plan-item"));
    // console.log("plansArray: ", plansArray);

    plansArray.sort((a, b) => {
        let priceA = parseInt(a.getAttribute("data-price").replace("₹", ""));
        let priceB = parseInt(b.getAttribute("data-price").replace("₹", ""));
        return order === "asc" ? priceA - priceB : priceB - priceA;
    });

    // Reorder plans in the DOM
    plansArray.forEach(plan => {
        let categoryId = plan.getAttribute("data-category");
    
        // ✅ Skip if categoryId is 0
        if (categoryId === "0") {
            console.warn(`⚠️ Skipping plan with category ID 0`);
            return; // Skip this iteration
        }
    
        let targetDiv = document.getElementById(`pills-${categoryId}`);
    
        if (!targetDiv) {
            console.error(`❌ Element with ID pills-${categoryId} not found, skipping...`);
            return; // Skip this iteration
        }
    
        let planContainer = targetDiv.querySelector(".row");
        if (!planContainer) {
            console.error(`❌ Row container missing inside #pills-${categoryId}, skipping...`);
            return; // Skip this iteration
        }
    
        planContainer.appendChild(plan);
    });
    
}


// **Show Plan Details in Modal**
function showPlanDetails(planId) {
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
                        extraText = benefit.Extras ? `<span class="text-muted small">(${benefit.Extras})</span>` : "";
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

            document.getElementById("modalBenefits").innerHTML = benefitsHtml;

            fetch(`http://localhost:8083/api/categories/${plan.categoryId}`)
                .then(response => response.json())
                .then(category => {
                    document.getElementById('modalCategory').textContent = `Category: ${category.categoryName}`;
                });

            const modal = new bootstrap.Modal(document.getElementById('planDetailsModal'));
            modal.show();
        })
        .catch(error => console.error("Error fetching plan details:", error));
}

// **Save Current State to Undo Stack**
function saveState(plans) {
    undoStack.push(JSON.stringify(plans));
}

// **Undo Last Action**
function undoLastAction() {
    if (undoStack.length > 0) {
        const lastState = JSON.parse(undoStack.pop());
        populatePlans(lastState);
    } else {
        alert("No actions to undo");
    }
}

// Function to load categories dynamically from API
function loadCategories() {
    fetch("http://localhost:8083/api/categories")
        .then(response => response.json())
        .then(categories => {
            const categoryDropdown = document.getElementById("planCategory");
            categoryDropdown.innerHTML = '<option value="">Select a category</option>'; // Reset dropdown
            categories.forEach(category => {
                let option = document.createElement("option");
                option.value = category.categoryId;  // ✅ Use correct key
                option.textContent = category.categoryName;
                categoryDropdown.appendChild(option);

                const categorySelect = document.getElementById("categorySelect");
                categorySelect.innerHTML = '<option value="">-- Select Category --</option>'; // Reset
                categories.forEach(category => {
                    categorySelect.innerHTML += `<option value="${category.categoryId}">${category.categoryName}</option>`;
            });

            });
        })
        .catch(error => console.error("❌ Error fetching categories:", error));
}

// Function to load categories dynamically from API
function loadCategoriesUpdate() {
    return new Promise((resolve, reject) => {
        fetch("http://localhost:8083/api/categories")
            .then(response => response.json())
            .then(categories => {
                const categoryDropdown = document.getElementById("updatePlanCategory");
                categoryDropdown.innerHTML = '<option value="">Select a category</option>'; // Reset dropdown

                categories.forEach(category => {
                    let option = document.createElement("option");
                    option.value = category.categoryId;  
                    option.textContent = category.categoryName;
                    categoryDropdown.appendChild(option);
                });

                console.log("✅ Categories loaded successfully.");
                resolve(); // ✅ Resolving the Promise when categories are loaded
            })
            .catch(error => {
                console.error("❌ Error fetching categories:", error);
                reject(error);
            });
    });
}


// Call this function when the modal opens
document.getElementById("addPlanModal").addEventListener("show.bs.modal", loadCategories);


// ✅ Open Add Plan Modal
$('#addPlanButton').on('click', function () {
    // fetchCategories();
    $('#addPlanModal').modal('show');
});

// Function to get selected OTT benefits as JSON
function getSelectedOTT() {
    let selectedOTTs = [];
    let extras = [];

    document.querySelectorAll("#ottCheckboxes input[type='checkbox']:checked").forEach(checkbox => {
        let ottName = checkbox.value;
        let extraBenefitsInput = checkbox.parentElement.querySelector(".extra-benefit");
        let extraBenefit = extraBenefitsInput ? extraBenefitsInput.value.trim() : "";

        let ottObject = { "OTT": ottName };
        if (extraBenefit) {
            ottObject.Extras = extraBenefit;
        }
        selectedOTTs.push(ottObject);
    });


    // Construct JSON with OTT and Extras
    return JSON.stringify({ "OTT": selectedOTTs, "Extras": extras });
}

// ✅ Show text area when OTT is selected
document.querySelectorAll(".ott-checkbox").forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        let extraBenefitInput = this.parentElement.querySelector(".extra-benefit");
        if (this.checked) {
            if (!extraBenefitInput) {
                extraBenefitInput = document.createElement("input");
                extraBenefitInput.type = "text";
                extraBenefitInput.className = "form-control extra-benefit mt-1";
                extraBenefitInput.placeholder = "Enter extra benefits";
                this.parentElement.appendChild(extraBenefitInput);
            }
        } else {
            if (extraBenefitInput) {
                extraBenefitInput.remove();
            }
        }
    });
});


// ✅ Add a new plan
document.getElementById("addPlanForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const planData = {
        planName: document.getElementById("planName").value,
        price: parseFloat(document.getElementById("planPrice").value),
        validityDays: parseInt(document.getElementById("planValidity").value),
        data: document.getElementById("planData").value || null,
        sms: document.getElementById("planSms").value || null,
        calls: document.getElementById("planCalls").value || null,
        additionalBenefits: getSelectedOTT(), // Convert checkboxes to JSON
        status: document.getElementById("planStatus").value,
        category: { categoryId: parseInt(document.getElementById("planCategory").value) }
    };

    const token = sessionStorage.getItem("adminToken");

    fetch("http://localhost:8083/api/plans", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`  // ✅ Include Authorization header
        }, // ✅ Include Authorization header
        body: JSON.stringify(planData)
    })
    .then(response => response.json())
    .then(() => {
        $('#addPlanModal').modal('hide');

        const planForm = document.getElementById("addPlanForm");

        // ✅ Clear form fields
        planForm.reset(); // Reset all input fields

        // ✅ Uncheck all checkboxes for OTT benefits
        document.querySelectorAll("#addPlanForm input[type=checkbox]").forEach(checkbox => {
            checkbox.checked = false;
        });

         // ✅ Hide all extra benefit text areas
         document.querySelectorAll(".ott-extra").forEach(textarea => {
            textarea.classList.add("hidden");
            textarea.value = "";
        });

         // 🔥 Clear existing plans to prevent duplication
         document.querySelectorAll(".tab-pane .row").forEach(container => container.innerHTML = "");

        fetchPlans();

        $('#successModal').modal('show');

    })
    .catch(error => {
        console.error("❌ Error adding plan:", error);

        // ❌ Show error modal
        $('#errorModal').modal('show');
    });
});

// ✅ Edit a plan
function editPlan(planId) {
    fetch(`http://localhost:8083/api/plans/plan/${planId}`)
        .then(response => response.json())
        .then(plan => {
            // 🟢 First, fetch categories BEFORE setting values
            loadCategoriesUpdate().then(() => {
                document.getElementById("updatePlanId").value = plan.planId;
                document.getElementById("updatePlanName").value = plan.planName;
                document.getElementById("updatePlanPrice").value = plan.price;
                document.getElementById("updatePlanData").value = plan.data;
                document.getElementById("updatePlanSms").value = plan.sms;
                document.getElementById("updatePlanCalls").value = plan.calls;
                document.getElementById("updatePlanValidity").value = plan.validityDays;
                document.getElementById("updatePlanStatus").value = plan.status;

                

                // ✅ Wait for categories to load, then set category
                document.getElementById("updatePlanCategory").value = plan.category ? plan.category.categoryId : ""; 

                // ✅ Show the modal after everything is set
                $('#updatePlanModal').modal('show');
            });
        })
        .catch(error => console.error("❌ Error fetching plan details:", error));
}


// ✅ Update a plan
document.getElementById("updatePlanForm").addEventListener("submit", function (event) {
    event.preventDefault();

    
    const updatedPlan = {
        planId: parseInt(document.getElementById("updatePlanId").value),
        planName: document.getElementById("updatePlanName").value,
        price: parseFloat(document.getElementById("updatePlanPrice").value),
        validityDays: parseInt(document.getElementById("updatePlanValidity").value),
        data: document.getElementById("updatePlanData").value || null,
        sms: document.getElementById("updatePlanSms").value || null,
        calls: document.getElementById("updatePlanCalls").value || null,
        additionalBenefits: getSelectedOTT(), // Convert checkboxes to JSON
        status: document.getElementById("updatePlanStatus").value,
        category: { categoryId: parseInt(document.getElementById("updatePlanCategory").value) }
    };

    fetch(`http://localhost:8083/api/plans/${updatedPlan.planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlan)
    })
    .then(() => {
        $('#updatePlanModal').modal('hide');

        // 🔥 Clear existing plans to prevent duplication
        document.querySelectorAll(".tab-pane .row").forEach(container => container.innerHTML = "");

        $('#editSuccessModal').modal('show');

        fetchCategories();

    })
    .catch(error => console.error("❌ Error updating plan:", error));
});

function deletePlan(planId) {
    // Store planId in a global variable for confirmation
    window.planToDelete = planId;

    // Show the confirmation modal
    const confirmModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    confirmModal.show();
}

// Handle "Yes, Deactivate" button click
document.getElementById("confirmDeactivateBtn").addEventListener("click", function () {
    if (!window.planToDelete) return;

    fetch(`http://localhost:8083/api/plans/${window.planToDelete}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
    })
    .then(() => {
        console.log("Plan made inactive successfully");

        // Close modal
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"));
        confirmModal.hide();

        // ✅ Refresh plan list
        fetchPlans(); 

        // ✅ Clear existing plans to prevent duplication
        document.querySelectorAll(".tab-pane .row").forEach(container => container.innerHTML = "");

        // Clear global variable
        window.planToDelete = null;
    })
    .catch(error => console.error("❌ Error updating plan status:", error));
});



document.getElementById("deleteCategoryBtn").addEventListener("click", () => {
    const categoryId = document.getElementById("categorySelect").value;
    
    if (!categoryId) {
        alert("⚠ Please select a category!");
        return;
    }

    // Store categoryId globally for confirmation action
    window.categoryToDelete = categoryId;

    // Show the delete confirmation modal
    const confirmModal = new bootstrap.Modal(document.getElementById("confirmDeleteCategoryModal"));
    confirmModal.show();
});

// Handle "Yes, Delete" button click
document.getElementById("confirmDeleteCategoryBtn").addEventListener("click", () => {
    if (!window.categoryToDelete) return;

    fetch(`http://localhost:8083/api/categories/${window.categoryToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => {
        if (!response.ok) throw new Error("❌ Failed to delete category");
        return response.text();
    })
    .then(data => {
        console.log("✅ Category deleted successfully");

        // Close the modal after deletion
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById("confirmDeleteCategoryModal"));
        confirmModal.hide();

        const modal = bootstrap.Modal.getInstance(document.getElementById("deleteCategoryModal"));
        if (modal) modal.hide();
        
        // Refresh categories and plans
        fetchCategories();
        fetchPlans();

        // Clear global variable
        window.categoryToDelete = null;
    })
    .catch(error => console.error("❌ Error deleting category:", error));
});


// **Add Category Button Click**
$('#addCategoryButton').on('click', function () {
    $('#addCategoryModal').modal('show');
});

// **Add a New Category**
$('#addCategoryForm').on('submit', function (e) {
    e.preventDefault();

    const newCategory = {
        categoryName: $('#categoryName').val(),
        description: $('#categoryDesc').val()
    };

    fetch("http://localhost:8083/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory)
    })
    .then(response => response.json())
    .then(() => {
        $('#addCategoryModal').modal('hide');
        fetchCategories(); // Refresh categories
    })
    .catch(error => console.error("Error adding category:", error));
});


//Plan Analysis
document.addEventListener("DOMContentLoaded", function () {
    fetchPlansForCharts();
});

// ✅ Fetch category-wise revenue & subscription data
function fetchPlansForCharts() {
    fetch("http://localhost:8083/api/plans/category-wise-details")
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch category-wise data.");
            return response.json();
        })
        .then(data => {
            console.log("✅ Category-wise Data Fetched:", data);

            let categoryRevenue = {};
            let categorySubscriptions = {};

            data.forEach(item => {
                let categoryName = item.categoryName || "Uncategorized";
                categoryRevenue[categoryName] = item.revenueGenerated || 0;
                categorySubscriptions[categoryName] = item.activeSubscribers || 1;
            });

            console.log("✅ Corrected Revenue Data:", categoryRevenue);
            console.log("✅ Corrected Subscriptions Data:", categorySubscriptions);

            // ✅ Render Updated Charts
            renderRevenueChart(categoryRevenue);
            renderSubscriptionsChart(categorySubscriptions);
        })
        .catch(error => console.error("❌ Error fetching category-wise data:", error));
}


// ✅ Render Revenue Chart
function renderRevenueChart(categoryRevenue) {
    const ctx = document.getElementById("revenueChart").getContext("2d");

    const labels = Object.keys(categoryRevenue);
    const data = Object.values(categoryRevenue);

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                label: "Total Revenue (₹)",
                data: data,
                backgroundColor: ["#007BFF","#9C27B0", "#FF6384", "#FFCE56", "#4CAF50"],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


// ✅ Render Subscriptions Chart
function renderSubscriptionsChart(categorySubscriptions) {
    const ctx = document.getElementById("subscriptionsChart").getContext("2d");

    const labels = Object.keys(categorySubscriptions);
    const data = Object.values(categorySubscriptions);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Total Subscriptions",
                data: data,
                backgroundColor: ["#007BFF","#9C27B0", "#FF6384", "#FFCE56", "#4CAF50"],
                borderWidth: 1,
                hoverBackgroundColor: "#4da3ff"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// renderRevenueChart();
// renderSubscriptionsChart();

/// ✅ Admin Logout Function (With API Integration)
function logout() {
    event.preventDefault(); // Prevent default link behavior
    console.log("🔹 Logging out...");

    let logoutScreen = document.getElementById("logoutScreen");
    logoutScreen.style.display = "flex"; // Show loading screen

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        // alert("❌ No active session found.");
        setTimeout(() => {
            logoutScreen.style.display = "none";
            window.location.href = "login.html";
        }, 2000); // Keep visible for 2 seconds
        return;
    }

    fetch("http://localhost:8083/auth/logout", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(error => { throw new Error(error); });
        }
        return response.text();
    })
    .then(message => {
        console.log("✅ Logout Successful:", message);
        sessionStorage.removeItem("adminToken"); // ✅ Remove Token
        sessionStorage.removeItem("adminRole");  // ✅ Remove Role
        setTimeout(() => {
            logoutScreen.style.display = "none";
            window.location.href = "login.html";
        }, 2000); // ✅ Redirect to Login Page
    })
    .catch(error => {
        console.error("❌ Logout Error:", error);
        alert("❌ Logout failed: " + error.message);
        logoutScreen.style.display = "none";
    });
}


const undoButton = `<button class="btn btn-warning ms-3" id="undoButton">Undo</button>`;
$('.d-flex.justify-content-end.mb-3.w-90').append(undoButton);