# MobiComm - Mobile Prepaid Recharge Application

## Overview
**MobiComm** is a comprehensive web-based mobile prepaid recharge system designed for **Mobi-Comm Services Ltd.**, a mobile service provider in India. The platform transforms the digital mobile recharge experience by providing users with a seamless, secure, and intuitive interface for browsing, selecting, and completing mobile prepaid recharges. It ensures a seamless and efficient user experience by integrating dummy payment gateways (RazorPay) and OTP-based authentication (Twilio).

### Problem Statement
Currently, customers rely on third-party platforms for mobile recharges, limiting the company's control over **customer engagement, promotions, and business insights**. MobiComm addresses these challenges by providing a **secure, scalable, and user-friendly** solution for both administrators and prepaid users.

### Key Objectives
- **Simplify the mobile recharge process** for end-users (Subscribers)
- **Provide a centralized platform** for recharge for Mobi-Comm
- **Ensure secure and swift transaction processing**
- **Create a user-friendly digital recharge ecosystem**

## Features

### Administrator Panel
- **Secure role-based authentication**
- **Comprehensive dashboard** with real-time analytics
- **Recharge plan management** (add, update, remove)
- **User management** capabilities (block/unblock users)
- **Transaction monitoring** system
- **Support ticket management** for handling customer issues
- **Reporting and business intelligence** tools

### Prepaid Mobile User
- **User Authentication:**
  - Mobile OTP-based login via Twilio
  - Secure password reset mechanism
- **Recharge Plans Browsing:**
  - Dynamic plan fetching from database
  - Real-time plan updates from admin
  - Filtering, sorting and search capabilities
- **Recharge Process:**
  - Simplified plan selection workflow
  - Multiple payment method support using integrated Razorpay
  - Instant transaction confirmation
  - Detailed transaction receipt generation
- **Transaction Management:**
  - Comprehensive recharge history
  - Downloadable transaction invoices
  - Search and filter options
- **Profile Management:**
  - Comprehensive user profile creation
  - Personal information updates
  - Saved recharge history
- **Notifications:**
  - Real-time SMS alerts through integrated Twilio
  - Email notifications for transactions and password reset through SMTP
  - In-app notification system
- **Support:**
  - Real-time support request submission
  - Communication channel with admin

## Tech Stack

### Frontend
- HTML5 for structure
- CSS3 for styling
- JavaScript for interactivity
- Bootstrap for responsive design

### Backend
- Spring Boot for application framework
- Spring Security for authentication
- Maven for dependency management

### Database
- MySQL for primary data storage
- Hibernate for database interactions

### Authentication
- Spring Security (JWT)
- Twilio OTP for user verification

### Payment Gateway
- Razorpay integration
- Secure transaction processing

### APIs
- RESTful API design

## Data Flow & Structure

### Entities Detailed Description

- **Users:** Stores user account information including personal details, authentication, and account status
- **Roles:** Contains different user role definitions and permissions
- **Categories:** Categorization system for recharge plans and other elements
- **Recharge_plans:** Contains all available mobile recharge plans with pricing and features
- **Recharge_history:** Records all recharge transactions performed by users
- **Payment_transactions:** Tracks all payment-related activities and their statuses
- **Addresses:** Stores user address information for billing and account purposes
- **Notifications:** Manages all system-generated notifications sent to users
- **Support_tickets:** Handles customer support requests and their resolution process
- **Ticket_admins:** Maps support tickets to admin users who handle them
- **Status_types:** Defines various status options for different entities in the system
- **Analytics:** Stores generated reports and analytical data
- **Revoked_tokens:** Maintains a record of invalidated authentication tokens for security

## Installation & Setup
1. Clone the repository:
```sh
git clone https://github.com/your-username/mobicomm.git
```
2. Navigate to the project directory:
```sh
cd mobicomm
```
3. Install dependencies:
```sh
mvn install
```
4. Configure database connection in `application.properties`
5. Run the application:
```sh
mvn spring-boot:run
```
6. Access the application at `http://localhost:8080`

## **Installation & Setup**  

### **🔹 Backend (Spring Boot)**
1. Clone the repository:  
   ```sh
   git clone https://github.com/your-username/mobicomm.git
   ```
2. Navigate to the backend directory:  
   ```sh
   cd mobicomm-backend
   ```
3. Configure `application.properties` with your MySQL details:  
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/mobicomm
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   ```
4. Run the Spring Boot application:  
   ```sh
   mvn spring-boot:run
   ```

### **🔹 Frontend (HTML, JS, Bootstrap)**
1. Navigate to the frontend directory:  
   ```sh
   cd mobicomm-frontend
   ```
2. Open `index.html` in a browser to start the application.  

## Author
**Syed Anees J**  
*Email: aneesjha3@gmail.com*
