## Folder Description

### Root Directory: `POS-System/`

| File | Purpose |
|------|---------|
| `README.md` | Project documentation and overview |
| `INSTALLATION.md` | Installation instructions |
| `.gitignore` | Git ignore rules |

---

### `frontend/`

Contains the client-side application developed using React.js. Handles user interface, interaction, and frontend logic.

#### `frontend/public/`

Stores static files accessible directly by the browser.

| File | Purpose |
|------|---------|
| `index.html` | Main HTML template where React app is mounted |
| `test.html` | Testing page for experiments |

#### `frontend/src/`

Main source code of the frontend application.

##### `frontend/src/components/`

Reusable React components.

| File | Purpose |
|------|---------|
| `ModernPOS.jsx` | Main modern POS interface with tabs (Sales/Inventory/Dashboard) |
| `POSInterface.jsx` | Alternative POS interface for sales transactions |
| `SalesDashboard.jsx` | Sales statistics, analytics, and KPIs |
| `UserProfile.jsx` | User profile management (Admin can manage all users) |
| `RequestsManager.jsx` | Product request management (Admin approves/rejects) |
| `Login.jsx` | User login page with blue theme |
| `Register.jsx` | User registration page |
| `ReceiptPrinter.js` | 58mm thermal receipt printing |
| `ImageUpload.jsx` | Drag & drop image upload with compression |

##### `frontend/src/` Root Files

| File | Purpose |
|------|---------|
| `App.js` | Main React component with routing and navigation |
| `App.css` | Global application styles |
| `index.js` | React entry point |
| `index.css` | Base CSS styles |
| `reportWebVitals.js` | Performance metrics |
| `setupTests.js` | Testing configuration |

##### `frontend/` Root Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `package-lock.json` | Locked dependency versions |
| `.env` | Frontend environment variables (REACT_APP_API_URL) |

---

### `backend/`

Contains the server-side application for API handling, business logic, authentication, and database operations.

#### `backend/models/`

MongoDB database schemas.

| File | Purpose |
|------|---------|
| `Product.js` | Product schema (name, barcode, price, stock, image) |
| `Sale.js` | Sales transaction schema (invoice, items, totals) |
| `User.js` | User schema (username, password, name, role) |
| `ProductRequest.js` | Product request schema (pending requests from cashiers) |

#### `backend/controllers/`

Business logic and request handling.

| File | Purpose |
|------|---------|
| `productController.js` | Product CRUD operations |
| `posController.js` | POS sales and cart operations |
| `analyticsController.js` | Sales analytics and KPIs |
| `authController.js` | User authentication and management |
| `requestController.js` | Product request operations |

#### `backend/routes/`

API endpoints definition.

| File | Purpose |
|------|---------|
| `productRoutes.js` | Product API routes |
| `posRoutes.js` | POS API routes (scan, checkout) |
| `analyticsRoutes.js` | Analytics API routes |
| `authRoutes.js` | Authentication API routes |
| `requestRoutes.js` | Product request API routes |

#### `backend/middleware/`

Middleware functions.

| File | Purpose |
|------|---------|
| `auth.js` | JWT token verification for protected routes |

#### `backend/` Root Files

| File | Purpose |
|------|---------|
| `server.js` | Main entry point, Express setup, MongoDB connection |
| `.env` | Environment variables (PORT, MONGODB_URI, JWT_SECRET) |
| `package.json` | Backend dependencies and scripts |
| `package-lock.json` | Locked dependency versions |
