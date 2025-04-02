function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

document.addEventListener('DOMContentLoaded', () => {
    showSlide(currentSlide);
});

document.getElementById("Recharge").addEventListener("click", function() {
    window.location.href = "login.html";  // Change this to your login page URL
});

document.getElementById("Explore").addEventListener("click", function() {
    window.location.href = "prepaidPlans.html";  // Change this to your plans page URL
});

document.getElementById("explorePlans").addEventListener("click", function() {
    window.location.href = "prepaidPlans.html";  // Change this to your plans page URL
});

document.getElementById("Help").addEventListener("click", function() {
    window.location.href='support.html';
});

document.getElementById("Offers").addEventListener("click", function() {
    alert("No offers available at the moment.");
});

document.getElementById("offers").addEventListener("click", function() {
    alert("No offers available at the moment.");
});

document.getElementById('RechargeBtn').addEventListener('click', function() {
    var mobileNumber = document.getElementById('mobile-number').value;
    var promoCode = document.getElementById('promo-code').value;
    var mobileNumberPattern = /^[0-9]{10}$/;
    var mobileNumberError = document.getElementById('mobile-number-error');

    // Validate Mobile Number
    if (!mobileNumberPattern.test(mobileNumber)) {
        if (!mobileNumberError) {
            mobileNumberError = document.createElement('span');
            mobileNumberError.id = 'mobile-number-error';
            mobileNumberError.style.color = 'red';
            mobileNumberError.innerText = 'Please enter a valid 10-digit mobile number.';
            document.getElementById('mobile-number').parentNode.appendChild(mobileNumberError);
        }
        return;
    } else {
        if (mobileNumberError) {
            mobileNumberError.remove();
        }
    }

    // ✅ Step 1: User Login via OTP API to get JWT Token
    fetch("http://localhost:8083/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Invalid OTP.");
        }
        return response.json(); // ✅ Get JWT token from response
    })
    .then(data => {
        console.log("✅ Login Successful:", data);
        sessionStorage.setItem("tempToken", data.accessToken); // ✅ Store token
        sessionStorage.setItem("userRole", data.role); // ✅ Store role
        sessionStorage.setItem("mobileNumber", mobileNumber); // ✅ Correct key

        // ✅ Redirect to prepaid plans
        window.location.href = 'prepaidPlans.html';
    })
    .catch(error => {
        alert("Login failed: " + error.message);
    });
});


document.getElementById('mobile-number').addEventListener('input', function() {
var mobileNumber = this.value;
var mobileNumberPattern = /^[0-9]{10}$/;
var rechargeBtn = document.getElementById('RechargeBtn');

if (mobileNumberPattern.test(mobileNumber)) {
    rechargeBtn.disabled = false;
} 
else {
    rechargeBtn.disabled = true;
}
});

document.getElementById('promo-code').addEventListener('input', function() {
var validIcon = document.getElementById('valid-icon');
if (this.value.trim() !== '') {
    validIcon.style.display = 'inline';
} else {
    validIcon.style.display = 'none';
}
});

// Disable the button initially
document.getElementById('RechargeBtn').disabled = true;

document.getElementById("hero-recharge").addEventListener("click", function(){
    event.preventDefault();
    window.location.href='prepaidPlans.html';
});


document.addEventListener("DOMContentLoaded", fetchCategories);

function fetchCategories() {
    fetch("http://localhost:8083/api/categories")
        .then(response => response.json())
        .then(categories => {
            let categoryIds = {};

            categories.forEach(category => {
                categoryIds[category.categoryName.toLowerCase()] = category.categoryId;
            });

            // Fetch plans from selected categories
            const categoriesToShow = ["popular", "unlimited", "5g plans"];
            categoriesToShow.forEach(category => {
                if (categoryIds[category]) {
                    fetchPlansByCategory(categoryIds[category]);
                }
            });
        })
        .catch(error => console.error("Error fetching categories:", error));
}

function fetchPlansByCategory(categoryId) {
    fetch(`http://localhost:8083/api/plans/${categoryId}`)
        .then(response => response.json())
        .then(plans => {
            if (plans.length > 0) {
                populateCarousel(plans[0]); // Add only the first plan from each category
            }
        })
        .catch(error => console.error("Error fetching plans:", error));
}

function populateCarousel(plan) {
    const carouselContainer = document.getElementById("carouselPlansContainer");

    const isActive = carouselContainer.children.length === 0 ? "active" : "";

    const planHTML = `
    <div class="carousel-item ${isActive}">
    <div class="p-4 shadow-lg rounded-lg position-relative bg-white">
        <!-- Centered heading and price with blue accent -->
        <div class="text-center mb-3">
            <h3 class="h5 fw-bold text-primary mb-2">${plan.planName}</h3>
        </div>
                
        <!-- Plan details with better alignment and blue accents -->
        <div class="plan-details mb-2">
        <div class="d-flex align-items-center justify-content-center mb-3">
            <span class="badge bg-warning text-dark px-5 py-3 rounded-pill fw-bold" style="font-size: 1.2rem;">₹${plan.price}</span>
        </div>
            <div class="d-flex align-items-center mb-3">
                <div class="icon-container me-3 text-primary">
                    <i class="fas fa-wifi fa-lg"></i>
                </div>
                <p class="mb-0 text-secondary small"><span class="text-dark">${plan.data || "Unlimited Data"}</span></p>
            </div>

            
            <div class="d-flex align-items-center mb-3">
                <div class="icon-container me-3 text-primary">
                    <i class="fas fa-phone-alt fa-lg"></i>
                </div>
                <p class="mb-0 text-dark small">${plan.calls}</p>
            </div>
            
            <div class="d-flex align-items-center mb-3">
                <div class="icon-container me-3 text-primary">
                    <i class="far fa-calendar-alt fa-lg"></i>
                </div>
                <p class="mb-0 text-dark small">Validity: <span class="text-dark">${plan.validityDays} Days</span></p>
            </div>
        </div>
        
        <!-- Centered button with improved styling -->
        <div class="text-center mt-4">
            <button class="btn btn-primary px-3 py-2 rounded-pill" onclick="window.location.href='prepaidPlans.html'">
                View Details <i class="fas fa-arrow-right ms-2"></i>
            </button>
        </div>
    </div>
</div>
`;

    carouselContainer.innerHTML += planHTML;
}


// Get the button
var scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Show the button when scrolling down
window.onscroll = function() {
    if (document.documentElement.scrollTop > 400 || document.body.scrollTop > 400) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

// Scroll to top when clicked
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}