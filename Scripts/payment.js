document.addEventListener("DOMContentLoaded", function () {
    const mobileNumber = sessionStorage.getItem("mobileNumber");
    let token = sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken");
    const planId = sessionStorage.getItem("selectedPlanId");  

    console.log(mobileNumber, token, planId);

    if (!mobileNumber || !token || !planId) {
        alert("❌ Session expired or plan not selected. Redirecting to homepage.");
        window.location.href = "prepaidPlans.html";
        return;
    }

    fetchPlanDetails(planId);
    setupPaymentListeners();
});

// ✅ Fetch Plan Details from Backend
function fetchPlanDetails(planId) {
    fetch(`http://localhost:8083/api/plans/plan/${planId}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch plan details.");
            return response.json();
        })
        .then(plan => {
            document.getElementById("summaryPrice").textContent = `Price: ₹${plan.price}`;
            document.getElementById("summaryData").textContent = `Data: ${plan.data}`;
            document.getElementById("summarySms").textContent = `SMS: ${plan.sms}`;
            document.getElementById("summaryCalls").textContent = `Calls: ${plan.calls}`;
            
            // ✅ Compute & Update Payment Summary
            updatePaymentSummary(plan.price);
        })
        .catch(error => console.error("❌ Error fetching plan details:", error));
}

// ✅ Update Payment Summary with GST Calculation
function updatePaymentSummary(planPrice) {
    const gstPercentage = 8;
    const gstAmount = (planPrice * gstPercentage) / 100;
    const totalAmount = planPrice + gstAmount;

    document.getElementById("amountLabel").textContent = `Amount: ₹${planPrice.toFixed(2)}`;
    document.getElementById("gstlabel").textContent = `GST(8%): ₹${gstAmount.toFixed(2)}`;
    document.getElementById("totalLabel").textContent = `Total Amount: ₹${totalAmount.toFixed(2)}`;
    document.getElementById("paymentamount").textContent = `Amount to be paid: ₹${totalAmount.toFixed(2)}`;
}

function togglePaymentInputs() {
    var paymentMethod = document.getElementById("paymentMethod").value;
    document.getElementById("upiOptions").style.display = (paymentMethod === "upi") ? "block" : "none";
    document.getElementById("cardInputs").style.display = (paymentMethod === "card") ? "block" : "none";
    document.getElementById("bankOptions").style.display = (paymentMethod === "netbanking") ? "block" : "none";
    // validatePayment();  // Validate after toggling inputs
}

// document.addEventListener("DOMContentLoaded", function () {
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
        console.log(isValid);
    }

    const payButton = document.getElementById("payButton");
    payButton.disabled = !isValid;
}

// ✅ Handle Payment Submission
function processPayment() {
    const mobileNumber = sessionStorage.getItem("mobileNumber");
    let token = sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken");
    const planId = sessionStorage.getItem("selectedPlanId");
    const paymentMethod = document.getElementById("paymentMethod").value;
    
    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

         // ✅ Remove temp token after successful payment
         sessionStorage.removeItem("tempToken");
         sessionStorage.removeItem("quickRechargeMobile");

    fetch(`http://localhost:8083/api/users/${mobileNumber}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(user => {
        console.log("UserID: ",user.userId);
        return createRechargeEntry(user.userId, planId, paymentMethod);
    })
    .catch(error => {
        console.error("❌ Error fetching user ID:", error);
        alert("❌ Error processing payment.");
    });
}

// ✅ Create Recharge Entry in `recharge_history`
function createRechargeEntry(userId, planId, paymentMethod) {
    let token = sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken");
    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    // ✅ Extract correct amount
    const totalAmountMatch = document.getElementById("totalLabel").textContent.match(/₹([\d.]+)/);
    const amount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : NaN;

    if (isNaN(amount)) {
        console.error("❌ Invalid amount detected:", totalAmountMatch);
        alert("❌ Payment amount calculation error. Please try again.");
        return;
    }

    const rechargePayload = {
        userId: userId,
        planId: planId,
        amount: amount,
        rechargeMode: paymentMethod
    };

    console.log("Recharge Request Payload:", rechargePayload);

    return fetch("http://localhost:8083/api/recharge-history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(rechargePayload)
    })
    .then(response => {
        if (response.status === 403) {
            throw new Error("❌ Unauthorized. Ensure you are logged in.");
        }
        if (response.status === 415) {
            throw new Error("❌ Unsupported Media Type. Check Content-Type.");
        }
        if (!response.ok) throw new Error("❌ Failed to create recharge entry.");
        return response.json();
    })
    .then(recharge => {
        console.log("✅ Recharge Created:", recharge);

        return createPaymentTransaction(userId, recharge.rechargeId, paymentMethod);
    })
    .catch(error => {
        console.error("❌ Error creating recharge entry:", error);
        alert(error.message);
    });
}


// ✅ Create Payment Transaction Entry
function createPaymentTransaction(userId, rechargeId, paymentMethod) {
    console.log("🔹 Sending Payment Transaction Request for UserID:", userId, "RechargeID:", rechargeId);

    const totalAmountMatch = document.getElementById("totalLabel").textContent.match(/₹([\d.]+)/);
    const amount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : NaN;

    if (isNaN(amount)) {
        console.error("❌ Invalid amount detected:", totalAmountMatch);
        alert("Payment amount calculation error. Please try again.");
        return;
    }

    return fetch("http://localhost:8083/api/payments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken")}`
        },
        body: JSON.stringify({
            userId: userId,
            rechargeId: rechargeId,
            amount: amount,
            paymentMethod: paymentMethod,
            transactionType: "Recharge",
            status: "successful"
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(`❌ Payment API Error: ${err.message}`);
            });
        }
        return response.json();
    })    
    .then(transaction => {
        console.log("✅ Payment Transaction Created:", transaction);
        showPaymentSuccess(transaction.transactionId, paymentMethod);
    })
    .catch(error => {
        console.error("❌ Error creating payment transaction:", error);
        alert("❌ Payment failed.");
    });
}

// ✅ Show Payment Success Modal
function showPaymentSuccess(transactionId, paymentMethod) {
    document.getElementById('transactionId').textContent = transactionId;
    document.getElementById('transactionPaymentMethod').textContent = paymentMethod;

    const now = new Date();
    document.getElementById('transactionDate').textContent = now.toLocaleDateString();
    document.getElementById('transactionTime').textContent = now.toLocaleTimeString();

    $('#paymentSuccessModal').modal('show');
}

$('#paymentSuccessModal').on('show.bs.modal', function () {
    console.log("✅ Showing success modal...");

    // ✅ Ensure the success tick is visible with animation
    const successContainer = document.querySelector('.success-icon-container');
    const successTick = document.querySelector('.success-tick');

    successContainer.classList.add('show-success'); // Scale up & fade in
    successTick.classList.add('show-success'); // Make tick visible
});

// ✅ Setup Payment Listeners
function setupPaymentListeners() {
    document.getElementById("payment-form").addEventListener("submit", function (e) {
        e.preventDefault();
        processPayment();
    });
}

document.getElementById("downloadInvoiceBtn").addEventListener("click", generateInvoice);

function generateInvoice() {
    const transactionId = document.getElementById("transactionId").textContent;
    const userMobile = sessionStorage.getItem("mobileNumber");

    if (!transactionId || !userMobile) {
        alert("❌ Missing transaction details.");
        return;
    }

    let token = sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken");

    fetch(`http://localhost:8083/api/users/${userMobile}/recent-recharge`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("❌ Failed to fetch recharge details.");
        }
        return response.json();
    })
    .then(recharge => {
        console.log("✅ Fetched Recharge Data:", recharge);

        // Extract details for the invoice
        const userName = recharge.userName || "Unknown User";
        const date = new Date(recharge.rechargeDate).toLocaleDateString();
        const time = new Date(recharge.rechargeDate).toLocaleTimeString();
        const price = recharge.amount;
        const paymentMethod = recharge.rechargeMode;
        const plan = recharge.plan.planName || "Custom Plan";

        // Call function to generate the invoice
        downloadInvoice(transactionId, userName, userMobile, date, time, price, paymentMethod, plan);
    })
    .catch(error => {
        console.error("❌ Error fetching recharge details:", error);
        alert("❌ Unable to generate invoice. Please try again.");
    });
}

//Invoice Download
function downloadInvoice(transactionId, userName, userMobile, date, time, price, paymentMethod, plan) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Load Logo (Replace 'logo.png' with your actual logo URL or Base64 string)
        const logoPath = "mobi-comm.png"; // Replace with your logo URL or base64
        const imgWidth = 40, imgHeight = 20;

        const loadImage = new Image();
        loadImage.src = logoPath;
        loadImage.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = loadImage.width;
            canvas.height = loadImage.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(loadImage, 0, 0);
            const base64Logo = canvas.toDataURL("image/png");

        // Add Logo
        doc.addImage(base64Logo, "PNG", 90, 10, imgWidth, imgHeight);
    
        // Invoice Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE", 90, 40);
    
        // Date & Time of Download
        const currentDate = new Date();
        const downloadDate = currentDate.toLocaleDateString();
        const downloadTime = currentDate.toLocaleTimeString();
    
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${downloadDate}`, 15, 50);
        doc.text(`Time: ${downloadTime}`, 160, 50);
    
        // Recharge Details in a Table Format
        const tableData = [
            ["User Name", userName],
            ["Mobile Number", userMobile],
            ["Transaction ID", transactionId],
            ["Date", date],
            ["Time", time],
            ["Amount", `Rs. ${price}`],
            ["Payment Method", paymentMethod],
            ["Plan", plan]
        ];
    
        // AutoTable - Creating Table
        doc.autoTable({
            startY: 60, // Position below date & time
            head: [["Title", "Details"]], // Table Header
            body: tableData,
            theme: "grid", // Table style
            styles: { fontSize: 10 },
            headStyles: { fillColor: [0, 122, 255] }, // Header Color
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 100 }, // First Column - Bold Titles
                1: { cellWidth: 100 } // Second Column - Data
            }
        });
    
        // Save the PDF
        doc.save(`Invoice_${transactionId}.pdf`);
    };
}
// Get the button
var scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Show the button when scrolling down
window.onscroll = function() {
    if (document.documentElement.scrollTop > 100 || document.body.scrollTop > 100) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

// Scroll to top when clicked
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}