$(document).ready(function () {
    $('#categoryPlansTable').DataTable({
        "paging": true,
        "info": true,
        "dom": '<"d-flex justify-content-between align-items-center custom-datatable-controls"lf>tip'
    });

    // Load plans from local storage on page load
    loadPlansFromStorage();
    renderRevenueChart();
});

// Plan data categorized by type
let plansByCategory = JSON.parse(localStorage.getItem('plansByCategory')) || {
    popular: [
        { price: "₹150", data: "1GB/day", sms: "50 SMS", calls: "200 mins", validity: "28 Days" },
        { price: "₹299", data: "2GB/day", sms: "100 SMS", calls: "250 mins", validity: "56 Days" },
        { price: "₹249", data: "1GB/day", sms: "150 SMS", calls: "Unlimited", validity: "42 Days" },
        { price: "₹399", data: "2GB/day", sms: "100 SMS", calls: "Unlimited", validity: "56 Days" }
    ],
    data: [
        { price: "₹50", data: "500MB", sms: "20 SMS", calls: "100 mins", validity: "14 Days" },
        { price: "₹99", data: "1.5GB/day", sms: "100 SMS", calls: "200 mins", validity: "28 Days" },
        { price: "₹150", data: "500MB", sms: "20 SMS", calls: "100 mins", validity: "42 Days" },
        { price: "₹199", data: "1.5GB/day", sms: "100 SMS", calls: "200 mins", validity: "56 Days" }
    ],
    topup: [
        { price: "₹20", data: "-", sms: "-", calls: "20 mins", validity: "5 Days" },
        { price: "₹50", data: "-", sms: "-", calls: "50 mins", validity: "15 Days" }
    ],
    calls: [
        { price: "₹30", data: "-", sms: "10 SMS", calls: "Unlimited", validity: "7 Days" },
        { price: "₹75", data: "-", sms: "50 SMS", calls: "Unlimited", validity: "30 Days" }
    ],
    unlimited: [
        { price: "₹199", data: "1.5GB/day", sms: "100 SMS", calls: "Unlimited", validity: "28 Days" },
        { price: "₹499", data: "3GB/day", sms: "100 SMS", calls: "Unlimited", validity: "84 Days" }
    ]
};

// Stack to store previous states
let undoStack = [];

// Function to create a plan card
function createPlanCard(plan, category, index) {
    const card = document.createElement("div");
    card.className = "card-item";
    card.innerHTML = `
        <div class="card-body">
            <div class="row first-row">
                <p class="price text-center fw-bold fs-4">${plan.price}</p>
            </div>
            <div class="row text-center d-flex flex-md-row flex-column">
                <div class="col d-flex flex-column align-items-center">
                    <p class="fw-bold mb-0">${plan.data}</p>
                    <p class="text-muted small">Data</p>
                </div>
                <div class="col d-flex flex-column align-items-center">
                    <p class="fw-bold mb-0">${plan.sms}</p>
                    <p class="text-muted small">SMS</p>
                </div>
                <div class="col d-flex flex-column align-items-center">
                    <p class="fw-bold mb-0">${plan.calls}</p>
                    <p class="text-muted small">Calls</p>
                </div>
            </div>
            <div class="row">
                <p class="validity text-center fw-bold mb-0" style="font-size: 1.1rem;">Validity: ${plan.validity}</p>
            </div>
        </div>
        <div class="card-footer text-center mt-2 d-flex">
            <button class="btn btn-primary updateBtn btn-sm me-2" onclick="editPlan('${category}', ${index})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger deleteBtn btn-sm" onclick="deletePlan('${category}', ${index})"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
    return card;
}

// Function to push the current state to the undo stack
function saveState() {
    undoStack.push(JSON.stringify(plansByCategory));
    console.log("State saved. Current undo stack:", undoStack); // Debug log
}

function undoLastAction() {
    if (undoStack.length > 0) {
        plansByCategory = JSON.parse(undoStack.pop());
        savePlansToStorage();

        // Dynamically get the active category from the UI
        const activeCategory = document.querySelector('.nav-link.active').id.split('-')[1];
        loadPlans(activeCategory); // Refresh the UI for the active category
    } else {
        alert("No actions to undo");
    }
}


// Function to load plans based on selected category
function loadPlans(category) {
    const plansContainer = document.getElementById("plansContainer");
    plansContainer.innerHTML = ""; // Clear existing plans
    const plans = plansByCategory[category];
    plans.forEach((plan, index) => {
        const card = createPlanCard(plan, category, index);
        plansContainer.appendChild(card);
    });
}

// Function to load plans from local storage
function loadPlansFromStorage() {
    const storedPlans = localStorage.getItem('plansByCategory');
    if (storedPlans) {
        plansByCategory = JSON.parse(storedPlans);
    }
    loadPlans("popular");
}

// Function to save plans to local storage
function savePlansToStorage() {
    localStorage.setItem('plansByCategory', JSON.stringify(plansByCategory));
}

// Initial load of popular plans
loadPlans("popular");

// Set up event listeners for category buttons
document.querySelectorAll('.nav-link').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const category = button.id.split('-')[1];
        loadPlans(category);
        document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Open modal when Add Plan button is clicked
$('#addPlanButton').on('click', function () {
    $('#addPlanModal').modal('show');
});

// Handle form submission for adding a new plan
$('#addPlanForm').on('submit', function (e) {
    e.preventDefault();
    saveState();

    // Get form data
    const plan = {
        price: $('#planPrice').val(),
        data: $('#planData').val(),
        sms: $('#planSms').val(),
        calls: $('#planCalls').val(),
        validity: $('#planValidity').val()
    };
    const category = $('#planCategory').val();

    // Add plan to the selected category
    plansByCategory[category].push(plan);

    // Save updated plans to local storage
    savePlansToStorage();

    // Refresh plan cards
    loadPlans(category);

    // Close modal
    $('#addPlanModal').modal('hide');

    // Clear form
    $('#addPlanForm')[0].reset();
});

// Function to delete a plan
// Function to delete a plan
function deletePlan(category, index) {
    // Save the category and index to be used in the confirmation handler
    $('#deleteConfirmationModal').data('category', category).data('index', index);
    $('#deleteCategoryName').text(category.charAt(0).toUpperCase() + category.slice(1));

    // Show the confirmation modal
    $('#deleteConfirmationModal').modal('show');
}

// Handle confirmation of deletion
$('#confirmDeleteButton').on('click', function () {
    const category = $('#deleteConfirmationModal').data('category');
    const index = $('#deleteConfirmationModal').data('index');

    // Remove the plan from the category
    plansByCategory[category].splice(index, 1);

    // Save updated plans to local storage
    savePlansToStorage();

    // Reload plans for the category
    loadPlans(category);

    // Hide the confirmation modal
    $('#deleteConfirmationModal').modal('hide');
});


// Function to edit a plan
function editPlan(category, index) {
    saveState();
    const plan = plansByCategory[category][index];

    // Fill the update form with existing plan details
    $('#updatePlanPrice').val(plan.price);
    $('#updatePlanData').val(plan.data);
    $('#updatePlanSms').val(plan.sms);
    $('#updatePlanCalls').val(plan.calls);
    $('#updatePlanValidity').val(plan.validity);

    // Open the modal for editing
    $('#updatePlanModal').modal('show');

    // Update form submission handler
    $('#updatePlanForm').off('submit').on('submit', function (e) {
        e.preventDefault();

        // Get updated form data
        const updatedPlan = {
            price: $('#updatePlanPrice').val(),
            data: $('#updatePlanData').val(),
            sms: $('#updatePlanSms').val(),
            calls: $('#updatePlanCalls').val(),
            validity: $('#updatePlanValidity').val()
        };

        // Update the plan in the selected category
        plansByCategory[category][index] = updatedPlan;

        // Save updated plans to local storage
        savePlansToStorage();

        // Refresh plan cards
        loadPlans(category);

        // Close modal
        $('#updatePlanModal').modal('hide');

        // Clear form
        $('#updatePlanForm')[0].reset();
    });
}

// Add event listener to the Undo button
$('#undoButton').on('click', function () {
    undoLastAction();
});

// Add the Undo button to the UI
const undoButton = `<button class="btn btn-warning" id="undoButton">Undo</button>`;
$('.d-flex.justify-content-end.mb-3.w-100').append(undoButton);

// Function to calculate total revenue by category and render doughnut chart
function renderRevenueChart() {
    const categories = Object.keys(plansByCategory);
    const revenueData = categories.map(category => {
        return plansByCategory[category].reduce((total, plan) => {
            // Extract numerical value from price string like "₹150"
            const price = parseInt(plan.price.replace(/[^0-9]/g, '')) || 0;
            return total + price;
        }, 0);
    });

    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            datasets: [{
                label: 'Total Revenue by Category',
                data: revenueData,
                backgroundColor: ['#2196F3','#4CAF50',  '#FFC107', '#FF5722', '#9C27B0'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderSubscriptionsChart() {
    const categories = Object.keys(plansByCategory);
    const subscriptionsData = categories.map(category => plansByCategory[category].length);

    const ctx = document.getElementById('subscriptionsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            datasets: [{
                label: 'Number of Subscriptions by Category',
                data: subscriptionsData,
                backgroundColor: ['#2196F3','#4CAF50',  '#FFC107', '#FF5722', '#9C27B0'],
                borderWidth: 1
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
                    position: 'bottom'
                }
            }
        }
    });
}

renderRevenueChart();
renderSubscriptionsChart();

// Logout Function
function logout() {
    event.preventDefault();
    console.log('Logging out...');
    let logoutScreen = document.getElementById('logoutScreen');

        // Show the loading screen
        logoutScreen.style.display = 'flex';

        setTimeout(function() {
            sessionStorage.removeItem('isLoggedIn'); // Remove login session
            logoutScreen.style.display = "none"; // Hide after 2 seconds
            window.location.href = "login.html"; // Redirect to login page
        },1500);

};