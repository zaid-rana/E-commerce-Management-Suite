# E-commerce Management Suite 🛍️

A full-stack e-commerce management application built with React, Node.js, MongoDB, and Docker. This comprehensive platform enables sellers to manage products, process orders, handle payments via Stripe, and engage with customers through an integrated dashboard.

**Repository:** [zaid-rana/E-commerce-Management-Suite](https://github.com/zaid-rana/E-commerce-Management-Suite)

---

## 🚀 Features

### Frontend (React + Vite)
- **Authentication System**
  - User registration and login
  - Email verification
  - Password reset with secure token-based flow
  - Protected routes and session management

- **E-commerce Storefront**
  - Browse and search products
  - Detailed product pages with images
  - Shopping cart functionality
  - Secure checkout process

- **Seller Dashboard**
  - Overview and analytics
  - Product management (add, edit, delete products)
  - Order management and tracking
  - User profile management
  - Banner/promotional image management
  - Responsive UI built with Material-UI and Tailwind CSS

### Backend (Node.js + Express)
- **API Routes**
  - Authentication (sign up, login, password reset)
  - Product management with image uploads
  - Order processing and tracking
  - Payment processing with Stripe integration
  - Banner management

- **Payment Processing**
  - Stripe integration for card payments
  - Webhook handling for payment confirmation
  - Secure transaction processing

- **Data Management**
  - MongoDB for persistent data storage
  - Passport.js for authentication strategies
  - JWT token-based authorization

- **File Management**
  - Cloudinary integration for image uploads
  - Secure image storage and delivery

---

## 📋 Tech Stack

### Frontend
- **React** 19.1.1
- **Vite** - Fast build tool and dev server
- **React Router** 7.8.2 - Client-side routing
- **Material-UI (MUI)** - UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Stripe React** - Payment integration
- **Axios** - HTTP client
- **Yup** - Form validation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **Stripe** - Payment processing
- **Cloudinary** - Cloud image storage
- **Nodemailer** - Email service

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and web server

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Docker** (v20.0+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18+) - for local development without Docker
- **npm** (v9+)

### External Services Required
- **Stripe Account** - for payment processing
- **Gmail Account** - for email notifications (with app password)
- **Cloudinary Account** - for image storage
- **MongoDB Atlas** (optional) - or use the included Docker MongoDB

---

## 📦 Installation & Setup

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/zaid-rana/E-commerce-Management-Suite.git
   cd I-Dashboard
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:
   ```env
   # Backend
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   SESSION_SECRET=your_session_secret_here

   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here

   # MongoDB
   MONGO_ROOT_USER=admin
   MONGO_ROOT_PASSWORD=admin123
   MONGO_DB_NAME=i_dashboard

   # Frontend
   FRONTEND_URL=http://localhost

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   VITE_publishable_key=pk_test_your_key_here

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Build and start services**
   ```bash
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Local Development (Without Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/zaid-rana/E-commerce-Management-Suite.git
   cd I-Dashboard
   ```

2. **Setup MongoDB locally**
   - Install MongoDB Community Edition
   - Start the MongoDB service

3. **Setup Backend**
   ```bash
   cd Backend
   npm install
   # Create .env file with variables from .env.example
   node server.js
   ```
   Backend runs on http://localhost:5000

4. **Setup Frontend** (in new terminal)
   ```bash
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:5173

---


## 🔐 Environment Variables

See `.env.example` for the complete list. Key variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `your_jwt_secret_key` |
| `MONGO_URL` | MongoDB connection string | Auto-generated for Docker |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `CLOUDINARY_*` | Cloudinary credentials | From Cloudinary dashboard |
| `EMAIL_USER` | Gmail address for sending emails | `your_email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | From Gmail settings |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/verify` - Verify email

### Products
- `GET /api/ecomm/products` - Get all products
- `GET /api/ecomm/products/:id` - Get product details
- `POST /api/ecomm/products` - Create product (seller)
- `PUT /api/ecomm/products/:id` - Update product
- `DELETE /api/ecomm/products/:id` - Delete product

### Orders
- `GET /api/order` - Get all orders
- `GET /api/order/:id` - Get order details
- `POST /api/order` - Create order
- `PUT /api/order/:id` - Update order status

### Payments
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/webhook` - Stripe webhook handler

### Banners
- `GET /api/banners` - Get banners
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner

---

## 🧪 Development & Testing

### Build Frontend
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Docker Issues
- **MongoDB connection error**: Ensure MongoDB container is healthy
  ```bash
  docker-compose ps
  docker-compose logs mongodb
  ```
- **Port already in use**: Change ports in `docker-compose.yml` and `.env`

### Common Issues
- **CORS errors**: Check `FRONTEND_URL` in backend `.env`
- **Payment failures**: Verify Stripe keys in `.env`
- **Email not sending**: Check Gmail app password and enable "Less secure apps"
- **Image upload fails**: Verify Cloudinary credentials

---

## 🔒 Security Considerations

- ✅ JWT-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ CORS protection with allowed origins
- ✅ Secure cookies (httpOnly, sameSite)
- ✅ Stripe webhook signature validation
- ✅ Environment variables for sensitive data
- ✅ Cloudinary for secure image storage

---

## 📝 License

This project is part of the E-commerce Management Suite. Please check the repository for license details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support & Contact

For questions or issues, please open an issue on GitHub or contact the maintainers.

**GitHub Repository:** [zaid-rana/E-commerce-Management-Suite](https://github.com/zaid-rana/E-commerce-Management-Suite)

---

**Made by [Zaid Rana](https://github.com/zaid-rana)**
