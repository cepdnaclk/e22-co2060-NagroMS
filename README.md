**NagroMS – Networked Agro Management System**

CO2060 – Second Year Software Engineering Project

NagroMS is a digital platform designed to connect farmers, retail shops, and direct customers through a centralized system. Our goal is to reduce farmers' dependency on middle vendors and improve fair market access using modern web technologies.

**Problem Statement**

   In Sri Lanka, many farmers face challenges such as:
      
      Heavy dependence on middle vendors → Reduced profit margins

      Lack of direct access to bulk buyers (Food cities, grocery shops)

      Fragmented agricultural services

      Limited access to real-time information

**NagroMS provides a unified digital platform that:**

Connects farmers directly with retailers and customers

Enables bulk purchasing from business hubs

Improves transparency in pricing

Supports better communication between stakeholders


**Main Objectives**

Provide fair market access for farmers

Reduce the influence of unnecessary middle vendors

Enable bulk business connections (retail shops, grocery stores)

Build a scalable and user-friendly agricultural management platform


**Target Users**

Farmers

Retail Shops / Grocery Stores

Direct Customers

Agricultural Experts

Service Providers

System Administrators

**System Architecture**

Frontend → Backend → Database

Frontend — User Interface for Farmers, Retailers, Customers (React.js)

Backend — Handles business logic and API services (Node.js + Express.js)

Database — Stores user data, product data, transactions (Firebase Firestore)

**LayerTechnology**

Frontend - React.js + CSS3 

Backend - Node.js + Express.js

Database - Firebase Firestore 

Authentication - Firebase Auth + JWT

Email Service - NodeMailer + Gmail SMTP

Real-Time - Firestore onSnapshot listeners

Version Control - Git + GitHub

**Prerequisites**

Node.js >= 18

npm >= 9

Firebase project (Firestore + Authentication enabled)

Gmail account with App Password (for OTP emails)

**Setup Instructions**

**1. Clone the Repository**
   
git clone https://github.com/cepdnaclk/e22-co2060-NagroMS.git

cd e22-co2060-NagroMS/code

**2. Backend Setup**

cd backend

#Create .env file with your credentials

cp .env.example .env

#Edit .env with your Firebase Admin SDK credentials and Gmail details

npm install

npm start

Backend runs on: http://localhost:5000

Health check: http://localhost:5000/health

**3. Frontend Setup**

cd frontend

#Create .env file

cp .env.example .env

#Edit .env with your Firebase client credentials

npm install

npm start

Frontend runs on: http://localhost:3000

**User Roles**

Farmer  - List crops, manage orders, track sales and inventory

Customer  - Browse and purchase fresh produce directly from farmers

Bulk Buyer / ShopPlace bulk - orders, manage procurement

Agricultural Expert - Offer advice and consultations to farmers

Service Provider  - Offer equipment rentals and agricultural services

API Documentation

Base URL: http://localhost:5000/api

Health

GET  /health                          Server health check

Authentication (Public)

POST /api/auth/register               Register new user
POST /api/auth/login                  Verify token and get profile
POST /api/auth/social-login           Google / Facebook login
POST /api/auth/find-user              Look up email by phone or NIC
POST /api/auth/send-otp               Send OTP to email
POST /api/auth/verify-otp             Verify OTP code
POST /api/auth/reset-password         Reset password

Authentication (Protected)

      GET  /api/auth/profile                Get current user profile
      PUT  /api/auth/roles                  Update user roles
      Farmer (Protected — Farmer role required)
      GET    /api/farmer/profile            Get farmer profile
      PUT    /api/farmer/profile            Update profile
      GET    /api/farmer/products           Get products
      POST   /api/farmer/products           Add product
      PUT    /api/farmer/products/:id       Update product
      DELETE /api/farmer/products/:id       Delete product
      GET    /api/farmer/orders             Get orders
      PUT    /api/farmer/orders/:id         Update order status
      GET    /api/farmer/equipment          Get equipment
      POST   /api/farmer/equipment          Add equipment
      DELETE /api/farmer/equipment/:id      Delete equipment
      GET    /api/farmer/inventory          Get inventory
      POST   /api/farmer/inventory          Add inventory item
      PUT    /api/farmer/inventory/:id      Update inventory
      DELETE /api/farmer/inventory/:id      Delete inventory item
      GET    /api/farmer/sales              Get sales records
      GET    /api/farmer/expenses           Get expenses
      POST   /api/farmer/expenses           Add expense
      GET    /api/farmer/loans              Get loans
      POST   /api/farmer/loans              Add loan
      

      e22-co2060-NagroMS/
      ├── code/
      │   ├── backend/
      │   │   ├── config/
      │   │   │   └── firebase.js           # Firebase Admin SDK init
      │   │   ├── controllers/
      │   │   │   ├── authController.js     # Auth logic + OTP
      │   │   │   ├── farmerController.js   # Farmer dashboard API
      │   │   │   └── expertController.js   # Expert API
      │   │   ├── middleware/
      │   │   │   └── authMiddleware.js     # JWT verify + role check
      │   │   ├── models/
      │   │   │   ├── userModel.js          # User Firestore CRUD
      │   │   │   ├── productModel.js       # Products
      │   │   │   ├── orderModel.js         # Orders
      │   │   │   ├── equipmentModel.js     # Equipment rentals
      │   │   │   ├── inventoryModel.js     # Farm inventory
      │   │   │   ├── saleModel.js          # Sales records
      │   │   │   └── expenseModel.js       # Expenses
      │   │   ├── routes/
      │   │   │   ├── authRoutes.js         # Auth endpoints
      │   │   │   └── farmerRoutes.js       # Farmer endpoints
      │   │   ├── server.js                 # Express app entry point
      │   │   ├── package.json
      │   │   └── .env                      # Not committed — see .env.example
      │   │
      │   └── frontend/
      │       ├── public/
      │       │   ├── index.html
      │       │   └── manifest.json
      │       ├── src/
      │       │   ├── components/
      │       │   │   └── Network/
      │       │   │       ├── CommunityNetwork.jsx
      │       │   │       └── RoleSwitcher.jsx
      │       │   ├── pages/
      │       │   │   ├── Login/            # LoginPage, SignUpPage, ForgotPasswordPage
      │       │   │   ├── Landingpage/      # Landing page
      │       │   │   ├── farmer/           # Farmer dashboard
      │       │   │   ├── Customer/         # Customer dashboard
      │       │   │   └── expert/           # Expert dashboard
      │       │   ├── services/             # API service functions
      │       │   ├── styles/               # Global CSS
      │       │   ├── utils/
      │       │   │   └── firebase.js       # Firebase client + auth functions
      │       │   ├── App.js                # Routes and navigation
      │       │   └── index.js              # React entry point
      │       ├── package.json
      │       └── .env                      # Not committed — see .env.example
      │
      └── docs/                             # GitHub project page
      
      
      
      
      
