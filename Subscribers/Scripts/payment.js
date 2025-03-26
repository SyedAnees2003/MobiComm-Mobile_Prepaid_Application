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
    // setupPaymentListeners();
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


// ✅ Setup Payment Button
document.addEventListener("DOMContentLoaded", function() {
    // Enable pay button by default since external payment is being used
    const payButton = document.getElementById("payButton");
    payButton.disabled = false;
    
    // Setup click event on pay button
    payButton.addEventListener("click", function() {
        // Call your external payment processing function here
        processPayment();
    });
    
    // Terms checkbox handling (optional)
    const termsCheck = document.getElementById("termsCheck");
    termsCheck.addEventListener("change", function() {
        payButton.disabled = !this.checked;
    });
});

function processPayment() {
    const mobileNumber = sessionStorage.getItem("mobileNumber");
    let token = sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken");
    const planId = sessionStorage.getItem("selectedPlanId");

    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    // ✅ Fetch User ID First
    fetch(`http://localhost:8083/api/users/${mobileNumber}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(user => {
        console.log("UserID: ", user.userId);
        createRazorpayOrder(user.userId, planId);
    })
    .catch(error => {
        console.error("❌ Error fetching user ID:", error);
        alert("❌ Error processing payment.");
    });
}

// ✅ Step 2: Create Razorpay Order
function createRazorpayOrder(userId, planId) {
    const totalAmountMatch = document.getElementById("totalLabel").textContent.match(/₹([\d.]+)/);
    const amount = totalAmountMatch ? parseFloat(totalAmountMatch[1]) : NaN;

    fetch("http://localhost:8083/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken")}`
         },
        body: JSON.stringify({ amount: amount })
    })
    .then(response => response.json())
    .then(order => {
        console.log("✅ Razorpay Order Created:", order);
        launchRazorpay(order.orderId, amount, userId, planId);
    })
    .catch(error => console.error("Error creating Razorpay order:", error));
}

// ✅ Step 3: Launch Razorpay Checkout
function launchRazorpay(orderId, amount, userId, planId) {
    const options = {
        key: "rzp_test_XHo8QzIJJiKasb",
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: "MobiComm Recharge",
        description: "Recharge Payment",
        order_id: orderId,
        handler: function (response) {
            console.log("✅ Razorpay Payment Successful:", response);
            createRechargeEntry(userId, planId, response.razorpay_payment_id, amount, "razorpay");
        },
        theme: { color: "#3399cc" }
    };

    console.log("✅ Razorpay Key:", options.key);

    const rzp = new Razorpay(options);
    rzp.open();
}

// ✅ Step 4: Create Recharge Entry in `recharge_history`
function createRechargeEntry(userId, planId, paymentId, amount, paymentMethod) {
    let token = sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken");
    if (!token) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    if (isNaN(amount)) {
        console.error("❌ Invalid amount detected:", amount);
        alert("❌ Payment amount calculation error. Please try again.");
        return;
    }

    const rechargePayload = {
        userId: userId,
        planId: planId,
        amount: amount,
        rechargeMode: paymentMethod,
        transactionId: paymentId
    };

    console.log("🔹 Creating Recharge Entry:", rechargePayload);

    fetch("http://localhost:8083/api/recharge-history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(rechargePayload)
    })
    .then(response => {
        if (!response.ok) throw new Error("❌ Failed to create recharge entry.");
        return response.json();
    })
    .then(recharge => {
        console.log("✅ Recharge Created:", recharge);

        // ✅ Remove temp token after successful payment
        sessionStorage.removeItem("tempToken");
        sessionStorage.removeItem("quickRechargeMobile");

        return createPaymentTransaction(userId, recharge.rechargeId, paymentId, amount, paymentMethod);
    })
    .catch(error => {
        console.error("❌ Error creating recharge entry:", error);
        alert(error.message);
    });
}

// ✅ Step 5: Create Payment Transaction Entry
function createPaymentTransaction(userId, rechargeId, paymentId, amount, paymentMethod) {
    console.log("🔹 Creating Payment Transaction for RechargeID:", rechargeId);

    if (isNaN(amount)) {
        console.error("❌ Invalid amount detected:", amount);
        alert("❌ Payment amount calculation error. Please try again.");
        return;
    }

    // Show the processing overlay
    document.getElementById("processScreen").style.display = "flex";

    fetch("http://localhost:8083/api/payments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("userToken") || sessionStorage.getItem("tempToken")}`
        },
        body: JSON.stringify({
            userId: userId,
            rechargeId: rechargeId,
            paymentId: paymentId,
            amount: amount,
            paymentMethod: paymentMethod
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
        console.log("🔹 Transaction ID:", transaction.transactionId);

        setTimeout(() => {
            // Hide the processing overlay after 2 seconds
            document.getElementById("processScreen").style.display = "none";
        }, 1500);
        showPaymentSuccess(transaction.transactionId, paymentMethod);
        const mobileNumber = sessionStorage.getItem("mobileNumber");

        sendPaymentNotification(mobileNumber, amount, transaction.transactionId, paymentMethod);
    })
    .catch(error => {
        console.error("❌ Error creating payment transaction:", error);
        alert("❌ Payment failed.");
        document.getElementById("processScreen").style.display = "none"; // Hide on error
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

function sendPaymentNotification(mobile, amount, transactionId, paymentMethod) {
    console.log("🔹 Sending Payment Notification to:", mobile);

    let message = `Your payment of Rs. ${amount} was successful. Transaction ID: ${transactionId}. Payment Method: ${paymentMethod}.`;

    fetch("http://localhost:8083/api/notifications/recharge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mobile: mobile,
            message: message
        })
    })
    .then(response => response.text())
    .then(data => {
        console.log("✅ Notification sent successfully:", data);
    })
    .catch(error => {
        console.error("❌ Error sending payment notification:", error);
    });
}

$('#paymentSuccessModal').on('show.bs.modal', function () {
    console.log("✅ Showing success modal...");

    // ✅ Ensure the success tick is visible with animation
    const successContainer = document.querySelector('.success-icon-container');
    const successTick = document.querySelector('.success-tick');

    successContainer.classList.add('show-success'); // Scale up & fade in
    successTick.classList.add('show-success'); // Make tick visible
});

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
                const imgWidth = 70; // Adjust width as needed
                const imgHeight = 15; // Adjust height as needed
                const pageWidth = doc.internal.pageSize.getWidth(); // Get page width

                
        // Centering the logo
        const centerX = (pageWidth - imgWidth) / 2;
        
        doc.addImage(base64Logo, "PNG", centerX, 10, imgWidth, imgHeight);
    
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
        head: [["Title", "Details"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }, // Ensure left & right spacing
        headStyles: { fillColor: [0, 122, 255] },
        tableWidth: "auto", // Ensures table does not extend to full width
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 70 }, // Title column
            1: { cellWidth: 90 } // Details column
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