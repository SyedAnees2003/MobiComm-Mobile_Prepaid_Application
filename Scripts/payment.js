let price = localStorage.getItem('planPrice');
const data = localStorage.getItem('planData');
const sms = localStorage.getItem('planSms');
const calls = localStorage.getItem('planCalls');

const summaryPrice = document.getElementById('summaryPrice');
const summaryData = document.getElementById('summaryData');
const summarySms = document.getElementById('summarySms');
const summaryCalls = document.getElementById('summaryCalls');

if (price && data && sms && calls) {
    summaryPrice.textContent = `Price: ${price}`;
    summaryData.textContent = `Data: ${data}`;
    summarySms.textContent = `SMS: ${sms}`;
    summaryCalls.textContent = `Calls: ${calls}`;
} else {
    summaryPrice.textContent = "No plan selected.";
}

if (price) {
    price = parseFloat(price.replace('₹', '').trim());

    if (!isNaN(price)) {
        document.getElementById('amountLabel').textContent = `Amount: ₹${price.toFixed(2)}`;

        const gst = price * 0.08;  // 8% GST
        document.getElementById('gstlabel').textContent = `GST(8%): ₹${gst.toFixed(2)}`;

        const total = price + gst;
        document.getElementById('totalLabel').textContent = `Total Amount: ₹${total.toFixed(2)}`;

        document.getElementById('paymentamount').textContent = `Amount to be paid:  ₹${total.toFixed(2)}`;
    } else {
        console.error("Price is not a valid number.");
    }
}

let lastScrollTop = 0;
const navbar = document.querySelector("header");

window.addEventListener("scroll", function () {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop) {
        // Scrolling down → Hide navbar
        navbar.style.top = "-88px"; // Adjust based on navbar height
    } else {
        // Scrolling up → Show navbar
        navbar.style.top = "0";
    }

    lastScrollTop = currentScroll;
});

function togglePaymentInputs() {
    var paymentMethod = document.getElementById("paymentMethod").value;
    document.getElementById("upiOptions").style.display = (paymentMethod === "upi") ? "block" : "none";
    document.getElementById("cardInputs").style.display = (paymentMethod === "card") ? "block" : "none";
    document.getElementById("bankOptions").style.display = (paymentMethod === "netbanking") ? "block" : "none";
    validatePayment();  // Validate after toggling inputs
}

$('#paymentSuccessModal').on('show.bs.modal', function () {
    const successContainer = document.querySelector('.success-icon-container');
    const successTick = document.querySelector('.success-tick');
    const successMessage = document.querySelector('.success-message');

    // Add the class that triggers the animation
    successContainer.classList.add('show-success');
    successTick.classList.add('show-success');
    successMessage.classList.add('show-success');

    // Generate and display transaction details
    const transactionId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const paymentMethod = document.getElementById("paymentMethod").value;

    document.getElementById('transactionId').textContent = transactionId;
    document.getElementById('transactionDate').textContent = date;
    document.getElementById('transactionTime').textContent = time;
    document.getElementById('transactionPaymentMethod').textContent = paymentMethod;

    // Fetch current user mobile number from sessionStorage
    const loggedInMobile = sessionStorage.getItem("mobileNumber");

    // Get plan details
    const price = localStorage.getItem('planPrice');
    const category = localStorage.getItem('planCategory');

    // Create transaction object
    const transaction = {
        transactionId,
        date,
        time,
        paymentMethod,
        price,
        category,
        data,
        sms,
        calls,
        mobile: loggedInMobile // Associate with user
    };

    // Retrieve existing recharge history or create a new array
    let rechargeHistory = JSON.parse(localStorage.getItem("rechargeHistory")) || [];

    // Add new transaction
    rechargeHistory.push(transaction);

    // Store updated history in localStorage
    localStorage.setItem("rechargeHistory", JSON.stringify(rechargeHistory));
});

function validatePayment() {
    let isValid = false;
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (paymentMethod === "upi") {
        isValid = document.querySelector("input[name='upiProvider']:checked") !== null; // Check if any UPI provider is selected
    }
        else if (paymentMethod === "card") {
        const cardNumber = document.getElementById("cardNumber").value.trim();
        const expiryDate = document.querySelector("input[placeholder='MM/YY']").value.trim();
        const cvv = document.querySelector("input[placeholder='CVV']").value.trim();

        // Validate card number (16 digits)
        const isCardNumberValid = /^\d{16}$/.test(cardNumber);

        // Validate expiry date (MM/YY format)
        const isExpiryDateValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate);

        // Validate CVV (3 or 4 digits)
        const isCvvValid = /^\d{3,4}$/.test(cvv);

        isValid = isCardNumberValid && isExpiryDateValid && isCvvValid;  
    }
    else if (paymentMethod === "netbanking") {
        isValid = document.querySelector("input[name='bank']:checked") !== null; // Check if any bank is selected
    }

    const payButton = document.getElementById("payButton");
    payButton.disabled = !isValid;
}

// Payment method and UPI provider/bank selection
document.addEventListener("DOMContentLoaded", function () {
    const paymentMethod = document.getElementById("paymentMethod");
    const upiOptions = document.getElementById("upiOptions");
    const cardInputs = document.getElementById("cardInputs");
    const bankOptions = document.getElementById("bankOptions");
    const payButton = document.querySelector(".btn-primary");

    // Listen to payment method selection
    paymentMethod.addEventListener("change", function () {
        upiOptions.style.display = "none";
        cardInputs.style.display = "none";
        bankOptions.style.display = "none";

        if (this.value === "upi") upiOptions.style.display = "block";
        else if (this.value === "card") cardInputs.style.display = "block";
        else if (this.value === "netbanking") bankOptions.style.display = "block";

        // Reset form fields and classes
        document.querySelectorAll("input[name='upiProvider'], input[name='bank']").forEach(item => item.checked = false);
        document.getElementById("cardNumber").value = "";
        validatePayment();
    });

    // Listen to UPI provider and Bank selection
    document.querySelectorAll("input[name='upiProvider']").forEach(item => {
        item.addEventListener("change", validatePayment);
    });

    document.querySelectorAll("input[name='bank']").forEach(item => {
        item.addEventListener("change", validatePayment);
    });

    // Card number input validation
    document.getElementById("cardNumber").addEventListener("input", function () {
        const cardNumber = this.value.trim();
        const isCardNumberValid = /^\d{16}$/.test(cardNumber);
        this.classList.toggle("is-invalid", !isCardNumberValid);
        validatePayment();
    });

    // Expiry date input validation
    document.querySelector("input[placeholder='MM/YY']").addEventListener("input", function () {
        const expiryDate = this.value.trim();
        const isExpiryDateValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate);
        this.classList.toggle("is-invalid", !isExpiryDateValid);
        validatePayment();
    });

    // CVV input validation
    document.querySelector("input[placeholder='CVV']").addEventListener("input", function () {
        const cvv = this.value.trim();
        const isCvvValid = /^\d{3,4}$/.test(cvv);
        this.classList.toggle("is-invalid", !isCvvValid);
        validatePayment();
    });

    // Initial validation
    payButton.disabled = true;

    // Handle form submission
    document.getElementById("payment-form").addEventListener("submit", function (e) {
        e.preventDefault();
        $('#paymentSuccessModal').modal('show');

        document.body.style.pointerEvents = "none";

        setTimeout(function () {
            $('#paymentSuccessModal').modal('hide'); // Hide the modal
            window.history.back(); // Navigate back
        }, 3000);
    });
});