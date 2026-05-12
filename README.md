# 🛒 Inventory & POS System

A complete Point of Sale (POS) system with inventory management, barcode scanning, sales analytics, and thermal receipt printing. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🛒 POS Interface
- Barcode scanning (physical scanner or manual entry)
- Real-time cart with quantity controls
- Automatic price calculation with VAT (12%)
- Product images display
- Search and filter products
- Responsive design for all devices

### 📦 Inventory Management
- Add, edit, and delete products
- Stock tracking with automatic updates
- Low stock alerts (configurable threshold)
- Product categories
- Drag & drop image upload
- Bulk product management

### 📊 Sales Dashboard
- Real-time sales analytics
- Today's revenue and transactions
- Total products and inventory value
- Low stock items monitoring
- Top selling products (30 days)
- Visual KPI cards

### 🧾 Receipt Printing
- 58mm thermal receipt printer support
- Auto-cut functionality
- BIR-compliant format (Philippines)
- PHP currency with thousand separators
- Automatic print on checkout

### 🔐 User Management
- User registration and login
- JWT authentication
- Role-based access (Admin / Cashier)
- Password encryption (bcrypt)

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **Axios** - HTTP client
- **react-dropzone** - Image upload

### Development Tools
- **Nodemon** - Auto-restart server
- **ESLint** - Code linting

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/inventory-pos-system.git
cd inventory-pos-system
