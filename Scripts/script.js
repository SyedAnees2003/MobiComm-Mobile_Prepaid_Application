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

$(document).ready(function () {
    $('#plansCarousel').carousel({
        interval: 3000, // 3 seconds per slide
        ride: 'carousel',
        pause: 'hover', // Pause on hover
        wrap: true // Loop back to first slide after last
    });
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

//Quick - Recharge 
document.getElementById('RechargeBtn').addEventListener('click', function() {
var mobileNumber = document.getElementById('mobile-number').value;
var promoCode = document.getElementById('promo-code').value;
var mobileNumberPattern = /^[0-9]{10}$/;
var mobileNumberError = document.getElementById('mobile-number-error');

if (!mobileNumberPattern.test(mobileNumber)) {
    if (!mobileNumberError) {
        mobileNumberError = document.createElement('span');
        mobileNumberError.id = 'mobile-number-error';
        mobileNumberError.style.color = 'red';
        mobileNumberError.innerText = 'Please enter a valid 10-digit mobile number.';
        document.getElementById('mobile-number').parentNode.appendChild(mobileNumberError);
    }
    return;
} 
else {
    if (mobileNumberError) {
        mobileNumberError.remove();
    }
    // event.preventDefault();
    // sessionStorage.setItem('isLoggedIn', 'true');
    // Store token in sessionStorage
    sessionStorage.setItem('rechargeToken', 'true');
    console.log(sessionStorage.getItem('rechargeToken'));
    window.location.href = 'prepaidPlans.html';
}
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
