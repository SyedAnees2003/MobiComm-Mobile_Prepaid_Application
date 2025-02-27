document.addEventListener('DOMContentLoaded', function () {
    // Initialize DataTable
    $('#expiryTable').DataTable({
        data: [
            ["John", "+91 1234567890", "Rs.299<br>Validity: 20 days<br>Data: 1.5GB/day", "04/05/2023", "24/05/2023", "<button class='btn btn-primary btn-sm'>View Profile</button>"],
            ["Alice", "+91 9876543210", "Rs.299<br>Validity: 20 days<br>Data: 1.5GB/day", "04/05/2023", "24/05/2023", "<button class='btn btn-primary btn-sm'>View Profile</button>"],
            ["Bob", "+91 5555555555", "Rs.299<br>Validity: 20 days<br>Data: 1.5GB/day", "04/05/2023", "24/05/2023", "<button class='btn btn-primary btn-sm'>View Profile</button>"]
        ],
        columns: [
            { title: "Name" },
            { title: "Mobile Number" },
            { title: "Plan Details" },
            { title: "Recharge Date" },
            { title: "Expiry Date" },
            { title: "Action" }
        ]
    });

    // Global variables for chart instances
    let transactionChart, userStatusChart, userCountChart,totalRevenueChart;

    function createCharts() {
        // Destroy existing chart instances if they exist
        if (transactionChart) transactionChart.destroy();
        if (userStatusChart) userStatusChart.destroy();
        if (userCountChart) userCountChart.destroy();
        if (totalRevenueChart) totalRevenueChart.destroy();

        // Transaction Line Chart
        const transactionCtx = document.getElementById('transactionChart').getContext('2d');
        transactionChart = new Chart(transactionCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Daily Transactions',
                    data: [65, 59, 80, 81, 56, 65, 70],
                    fill: false,
                    borderColor: 'rgb(5, 209, 250)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
            }
        });

        // User Status Pie Chart
        const userStatusCtx = document.getElementById('userStatusChart').getContext('2d');
        userStatusChart = new Chart(userStatusCtx, {
            type: 'pie',
            data: {
                labels: ['Active', 'Inactive', 'Blocked'],
                datasets: [{
                    data: [350, 100, 50],
                    backgroundColor: ['rgb(5, 209, 250)', 'rgb(255, 205, 86)', 'rgb(255, 99, 132)']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
            }
        });

        // New Subscribers Bar Chart
        const userCountCtx = document.getElementById('userCountChart').getContext('2d');
        userCountChart = new Chart(userCountCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Subscribers Count',
                    data: [120, 150, 180, 200, 220, 250],
                    backgroundColor: 'rgba(5, 209, 250, 0.5)',
                    borderColor: 'rgb(5, 209, 250)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } }
            }
        });

        // Total Revenue Per Month Bar Chart
        const revenueCtx = document.getElementById('totalRevenueChart').getContext('2d');
        totalRevenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Total Revenue (₹)',
                    data: [50000, 60000, 75000, 82000, 100000, 90000],
                    backgroundColor: 'rgba(99, 151, 255, 0.7)',
                    borderColor: 'rgb(71, 125, 251)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Call the function to create charts
    createCharts();

    // Resize Charts on Window Resize
    window.addEventListener("resize", function () {
        createCharts(); // Destroy and recreate charts on resize
    });
});

// Set global chart settings
Chart.defaults.maintainAspectRatio = false;


// Function to generate and download report
function generateReport(chartId) {
    const canvas = document.getElementById(chartId);

    if (!canvas) {
        console.error(`Canvas with ID '${chartId}' not found.`);
        return;
    }

    // Access the Chart instance directly from the canvas
    const chartInstance = Chart.getChart(chartId);
    if (!chartInstance) {
        console.error(`Chart instance for ID '${chartId}' not found.`);
        return;
    }

    const chartTitleElem = canvas.closest('.chart-item').querySelector('h4');
    const chartName = chartTitleElem ? chartTitleElem.textContent.trim() : 'Unknown Chart';

    // Extract labels and data
    const labels = chartInstance.data.labels;
    const dataset = chartInstance.data.datasets[0]; // Assuming one dataset per chart
    const data = dataset.data;

    // Format the report as CSV
    let reportContent = `Chart Name: ${chartName}\n\n`;
    reportContent += `Label, Value\n`;
    labels.forEach((label, index) => {
        reportContent += `${label}, ${data[index]}\n`;
    });

    // Create a Blob and trigger the download
    const blob = new Blob([reportContent], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${chartId}_report.csv`; // File name for the download
    downloadLink.click();
}

document.addEventListener('DOMContentLoaded', function () {
    // Get all the view buttons
    const viewButtons = document.querySelectorAll('.view-button');

    viewButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            // Get the data from the table row
            const row = this.closest('tr');
            const name = row.cells[0].textContent;
            const mobile = row.cells[1].textContent;
            const expiry = row.cells[2].textContent;

            // Set the data in the modal
            document.getElementById('subscriberName').textContent = name;
            document.getElementById('subscriberMobile').textContent = mobile;
            document.getElementById('subscriberExpiry').textContent = expiry;

            const expiryDate = new Date(expiry.split('/').reverse().join('-'));
                    const firstRechargeDate = new Date(expiryDate);
                    firstRechargeDate.setMonth(expiryDate.getMonth() - 1); // Set date to one month before expiry

                    // Sample recharge history data
                    const rechargeHistory = [
                        {
                            date: firstRechargeDate.toISOString().split('T')[0],
                            amount: '$20',
                            status: 'Successful',
                            plan: 'Sample Plan',
                            mode: 'UPI'
                        },
                        {
                            date: '2025-02-10',
                            amount: '$15',
                            status: 'Successful',
                            plan: 'Sample Plan',
                            mode: 'UPI'
                        },
                        {
                            date: '2025-02-05',
                            amount: '$30',
                            status: 'Failed',
                            plan: 'Sample Plan',
                            mode: 'Net Banking'
                        }
                    ];

                    // Populate the recharge history
                    const rechargeHistoryContainer = document.getElementById('rechargeHistory');
                    rechargeHistoryContainer.innerHTML = '';
                    rechargeHistory.forEach(history => {
                        const historyDiv = document.createElement('div');
                        historyDiv.classList.add('transaction-card');
                        historyDiv.innerHTML = `
                            <p><strong>Recharge Date:</strong> ${history.date}</p>
                            <p><strong>Amount:</strong> ${history.amount}</p>
                            <p><strong>Status:</strong> ${history.status}</p>
                            <p><strong>Plan:</strong> ${history.plan}</p>
                            <p><strong>Mode of Payment:</strong> ${history.mode}</p>
                            <hr />
                            `;

                        rechargeHistoryContainer.appendChild(historyDiv);
                    });

                    // Show the modal
                    const subscriberModal = new bootstrap.Modal(document.getElementById('subscriberModal'));
                    subscriberModal.show();
        });
    });
});

function showSnackbar() {
    var snackbar = document.getElementById("snackbar");
    snackbar.className = "snackbar show";
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}


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