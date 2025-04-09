# MobiComm - Mobile Prepaid Recharge Application

## Overview
**MobiComm** is a comprehensive web-based **mobile prepaid recharge system** designed to transform the digital mobile recharge experience. The platform aims to provide users with a seamless, secure, and intuitive interface for browsing, selecting, and completing mobile prepaid recharges. It ensures a seamless and efficient user experience by integrating dummy payment gateways (RazorPay) and OTP-based authentication (Twilio).

### Problem Statement
Currently, customers rely on third-party platforms for mobile recharges, which limits **customer engagement, data insights, and promotional capabilities** for the company. **MobiComm** solves this issue by offering a **secure, scalable, and user-friendly** platform that ensures better control over transactions, user management, and analytics.

### Key Objectives
- Simplify the mobile recharge process for end-users (Subscribers)
- Provide a centralized platform for recharge for Mobi-Comm
- Ensure secure and swift transaction processing
- Create a user-friendly digital recharge ecosystem

## Features

### User Features:
- **User Authentication:** Secure OTP-based login via Twilio API
- **Recharge Plans Browsing:** Real-time prepaid plan exploration
- **Recharge Process:** Simplified plan selection workflow and recharge
- **Transaction Management:** Make secure payments using multiple payment methods
- **Profile Management:** Profile customization and secure personal information updates
- **Notifications:** Email and SMS mechanisms using Twilio and Razorpay
- **Support:** Real-time support requests submission by subscriber

### Admin Features:
- Secure role-based authentication
- Comprehensive dashboard with real-time analytics
- Advanced recharge plan management
- Detailed user management capabilities
- Robust transaction monitoring system
- Comprehensive reporting and business intelligence tools

## Technology Stack

### Frontend:
- HTML5 for structure
- CSS3 for styling
- JavaScript for interactivity
- Bootstrap for responsive design

### Backend:
- Spring Boot for application framework
- Spring Security for authentication
- Maven for dependency management

### Database:
- MySQL for primary data storage
- Hibernate for database interactions

### Authentication:
- Spring Security (JWT)
- Twilio OTP for user verification

### Payment Gateway:
- Razorpay primary integration
- Secure transaction processing

### APIs:
- RESTful API design

## Database Design
MobiComm maintains a well-structured relational database to ensure scalability, modularity, and maintainability. Below are the key entities used in the system:

| Entity | Description |
|--------|-------------|
| **Users** | Stores user account information, including personal details, authentication credentials, and account status. |
| **Roles** | Contains different user roles such as ROLE_USER and ROLE_ADMIN, used for access control and permissions. |
| **Categories** | Defines plan categories (e.g., Popular, Entertainment, Unlimited) for organizing recharge plans and filtering UI content. |
| **Recharge_Plans** | Contains all mobile recharge plans with their respective pricing, features, validity, and associated category. |
| **Recharge_History** | Tracks every recharge made by users, including timestamp, plan, and status. |
| **Payment_Transactions** | Handles all payment-related records, including payment mode (Razorpay, Wallet, etc.), amount, and transaction status. |
| **Addresses** | Stores billing and residential address details for each user, enhancing profile and invoice management. |
| **Notifications** | Manages system-generated notifications for users regarding successful recharges, promotional alerts, and other events. |
| **Support_Tickets** | Handles customer support queries, including subject, message, priority, and resolution status. |
| **Ticket_Admins** | Maps each support ticket to an admin for tracking responses and resolution responsibilities. |
| **Status_Types** | Defines various status values used across multiple tables (e.g., active, inactive, pending, resolved). |
| **Analytics** | Stores system-generated reports and analytical metrics for admins to monitor transactions, trends, and revenue. |
| **Revoked_Tokens** | Maintains a list of invalidated JWT tokens to support secure logout and token lifecycle management. |

## Installation & Setup

### 🔹 Backend (Spring Boot)
1. Clone the repository:
   ```sh
   git clone https://github.com/SyedAnees2003/MobiComm-Mobile_Prepaid_Application.git
   ```
2. Navigate to the backend directory:
   ```sh
   cd SpringBoot-MobiComm
   ```
3. Configure `application.properties` with your MySQL details:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/mobilePrepaid
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   ```
4. Run the Spring Boot application:
   ```sh
   mvn spring-boot:run
   ```

### 🔹 Frontend (HTML, JS, Bootstrap)
1. Navigate to the frontend directory
2. Open `index.html` in a browser to start the application
3. Configure API keys in config.js for:
   - Twilio (SMS services)
   - RazorPay (payment processing)

## Author
**Syed Anees J**  
Email: aneesjha3@gmail.com