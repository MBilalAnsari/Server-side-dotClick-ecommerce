# E-commerce Backend API

A comprehensive Node.js backend for an e-commerce application with JWT authentication, product management, shopping cart, and Stripe payment integration.

## Features

- **User Authentication**: JWT-based registration and login
- **Role-based Access Control**: Admin and User roles
- **Product Management**: Full CRUD operations (Admin only)
- **Shopping Cart**: Add, update, remove items with product variants
- **File Upload**: Profile images and product images with Cloudinary
- **Payment Processing**: Stripe checkout integration
- **Product Filtering & Pagination**: Advanced filtering and sorting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Payment**: Stripe
- **Password Hashing**: bcryptjs
- **Validation**: Custom validators

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your environment variables:
     ```env
     PORT=5000
     NODE_ENV=development
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce_db
     JWT_SECRET=your_super_secret_jwt_key_here
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
     STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
     FRONTEND_URL=http://localhost:3000
     ```

4. **Create Admin User**
   ```bash
   npm run seed:admin
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start