# 🐾 PetPaw - Pet Grooming Platform

A full-stack web application for pet grooming services with a modern, playful design and comprehensive booking system.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Backend Features](#backend-features)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

PetPaw is a comprehensive pet grooming platform that connects pet owners with professional grooming services. The application features a modern, responsive design with playful animations and a complete booking system. Built with React frontend and Node.js backend, it provides a seamless experience for both customers and administrators.

### Key Highlights

- **Modern UI/UX**: Joyful, pet-themed design with smooth animations
- **Role-based Access**: Separate interfaces for users and administrators
- **Real-time Booking**: Interactive booking system with service selection
- **Message System**: Contact form with admin response capabilities
- **Gallery Management**: Image upload and display functionality
- **Analytics Dashboard**: Comprehensive admin analytics
- **Responsive Design**: Works seamlessly on all devices

## ✨ Features

### For Pet Owners
- 🏠 **Homepage**: Attractive landing page with service showcase
- 📅 **Booking System**: Easy appointment scheduling with service selection
- 👤 **User Dashboard**: View bookings, messages, and profile
- 💬 **Contact System**: Send messages to administrators
- 🖼️ **Gallery**: Browse grooming photos and results
- 🌙 **Dark/Light Mode**: Toggle between themes

### For Administrators
- 🛠️ **Admin Dashboard**: Comprehensive management interface
- 📊 **Analytics**: Booking statistics and revenue tracking
- ✅ **Booking Management**: Confirm, cancel, and manage appointments
- 💬 **Message Center**: Respond to customer inquiries
- 🖼️ **Gallery Management**: Upload and manage grooming photos
- 👥 **User Management**: View and manage user accounts

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0**: Modern UI library with hooks
- **React Router DOM 7.6.3**: Client-side routing
- **Bootstrap 5.3.7**: Responsive CSS framework
- **Axios 1.10.0**: HTTP client for API calls
- **React DatePicker 8.4.0**: Date selection component
- **Vite 7.0.0**: Fast build tool and dev server

### Backend
- **Node.js**: JavaScript runtime
- **Express.js 5.1.0**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose 8.16.1**: MongoDB object modeling
- **JWT 9.0.2**: JSON Web Token authentication
- **bcryptjs 3.0.2**: Password hashing
- **CORS 2.8.5**: Cross-origin resource sharing
- **dotenv 17.0.1**: Environment variable management

### Development Tools
- **Nodemon 3.1.10**: Auto-restart server during development
- **ESLint 9.29.0**: Code linting
- **PostCSS 8.5.6**: CSS processing

## 📁 Project Structure

```
PetPaw/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   │   ├── pages/         # React components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── config/
│   │   └── db.js          # Database configuration
│   ├── controllers/        # Business logic
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── GalleryImage.js
│   │   └── ContactMessage.js
│   ├── routes/            # API endpoints
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── gallery.js
│   │   ├── contact.js
│   │   └── analytics.js
│   ├── seed/              # Database seeding
│   │   └── demo.js
│   ├── server.js          # Express server
│   └── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/petpaw
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Database Setup

1. **Ensure MongoDB is running**
2. **Seed the database with demo data:**
   ```bash
   cd server
   node seed/demo.js
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.
```json
{
  "name": "Code Genix",
  "email": "codegenix@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.
```json
{
  "email": "codegenix@example.com",
  "password": "password123"
}
```

### Services Endpoints

#### GET `/api/services`
Retrieve all available grooming services.

#### POST `/api/services` (Admin only)
Create a new service.
```json
{
  "name": "Full Grooming",
  "description": "Complete grooming service",
  "price": 75,
  "duration": 120
}
```

### Bookings Endpoints

#### GET `/api/bookings`
Get user's bookings (requires authentication).

#### POST `/api/bookings`
Create a new booking.
```json
{
  "serviceId": "service_id_here",
  "date": "2024-01-15",
  "time": "10:00",
  "notes": "Special instructions"
}
```

#### PUT `/api/bookings/:id/confirm` (Admin only)
Confirm a booking.

#### PUT `/api/bookings/:id/cancel` (Admin only)
Cancel a booking.

### Contact Endpoints

#### POST `/api/contact`
Send a contact message.
```json
{
  "subject": "General Inquiry",
  "message": "I have a question about your services"
}
```

#### GET `/api/contact` (Admin only)
Get all contact messages.

#### PUT `/api/contact/:id/respond` (Admin only)
Respond to a contact message.
```json
{
  "response": "Thank you for your inquiry..."
}
```

### Analytics Endpoints

#### GET `/api/analytics` (Admin only)
Get comprehensive analytics data including:
- Total bookings
- Revenue statistics
- Popular services
- User registration trends

## 🎨 Frontend Features

### Homepage (`/`)
- **Hero Section**: Attractive landing with call-to-action
- **Services Showcase**: Display available grooming services
- **About Section**: Information about the business
- **Contact Information**: Easy access to contact details
- **Responsive Design**: Optimized for all screen sizes

### Authentication Pages

#### Login (`/login`)
- **Form Validation**: Real-time input validation
- **Error Handling**: Clear error messages
- **Remember Me**: Optional session persistence
- **Redirect Logic**: Smart navigation after login

#### Register (`/register`)
- **User Registration**: Complete account creation
- **Password Strength**: Visual password strength indicator
- **Email Validation**: Proper email format checking
- **Auto-login**: Automatic login after successful registration

### Booking System (`/booking`)
- **Service Selection**: Interactive service picker
- **Date/Time Picker**: User-friendly scheduling
- **Form Validation**: Comprehensive input validation
- **Confirmation**: Booking confirmation with details
- **Authentication Required**: Secure booking process

### User Dashboard (`/dashboard`)
- **Booking History**: View past and upcoming appointments
- **Message Center**: View admin responses to inquiries
- **Profile Information**: Display user details
- **Quick Actions**: Easy access to common tasks

### Admin Dashboard (`/admin`)
- **Overview Cards**: Key metrics at a glance
- **Booking Management**: Confirm/cancel appointments
- **Message Center**: Respond to customer inquiries
- **Analytics**: Comprehensive business insights
- **User Management**: View user accounts

## 🔧 Backend Features

### Authentication System
- **JWT Tokens**: Secure stateless authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-based Access**: User and admin roles
- **Middleware Protection**: Route-level authentication

### Database Models

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

#### Service Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  duration: Number,
  isActive: Boolean
}
```

#### Booking Model
```javascript
{
  userId: ObjectId,
  serviceId: ObjectId,
  date: Date,
  time: String,
  status: String,
  notes: String,
  createdAt: Date
}
```

#### ContactMessage Model
```javascript
{
  userId: ObjectId,
  subject: String,
  message: String,
  response: String,
  respondedAt: Date,
  createdAt: Date
}
```

#### GalleryImage Model
```javascript
{
  title: String,
  description: String,
  imageUrl: String,
  uploadedBy: ObjectId,
  createdAt: Date
}
```

### API Security
- **CORS Configuration**: Proper cross-origin handling
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Consistent error responses
- **Rate Limiting**: Protection against abuse

## 🔐 Authentication & Authorization

### JWT Implementation
- **Token Generation**: Secure token creation on login
- **Token Verification**: Middleware for protected routes
- **Token Refresh**: Automatic token renewal
- **Logout Handling**: Proper token invalidation

### Role-based Access Control
- **User Role**: Can book services, send messages, view dashboard
- **Admin Role**: Full access to all features including analytics
- **Route Protection**: Automatic redirect for unauthorized access
- **UI Adaptation**: Different interfaces based on user role

## 📊 Database Schema

### Collections Overview
1. **users**: User accounts and authentication
2. **services**: Available grooming services
3. **bookings**: Appointment records
4. **contactMessages**: Customer inquiries and responses
5. **galleryImages**: Photo gallery management

### Indexes
- **Email Index**: Fast user lookup by email
- **Date Indexes**: Efficient booking queries
- **Status Indexes**: Quick status-based filtering

## 🎯 Usage Guide

### For Pet Owners

1. **Registration**: Create an account with email and password
2. **Browse Services**: View available grooming services
3. **Book Appointment**: Select service, date, and time
4. **Contact Support**: Send messages for inquiries
5. **View Dashboard**: Check bookings and messages
6. **Browse Gallery**: View grooming results

### For Administrators

1. **Login**: Access admin dashboard
2. **Manage Bookings**: Confirm or cancel appointments
3. **Respond to Messages**: Answer customer inquiries
4. **View Analytics**: Monitor business performance
5. **Manage Services**: Add or modify services
6. **Upload Gallery**: Add grooming photos

## 🛠️ Development

### Code Style
- **ESLint Configuration**: Consistent code formatting
- **Component Structure**: Organized React components
- **API Structure**: RESTful endpoint design
- **Error Handling**: Comprehensive error management

### Testing
- **API Testing**: Use Postman or similar tools
- **Frontend Testing**: Manual testing of user flows
- **Database Testing**: Verify data integrity

### Common Issues & Solutions

#### Login Issues
- **Password Hashing**: Ensure proper bcrypt implementation
- **JWT Tokens**: Check token expiration and format
- **CORS**: Verify cross-origin configuration

#### Booking Issues
- **Date Validation**: Check date format and availability
- **Authentication**: Ensure user is logged in
- **Service Selection**: Verify service exists and is active

#### Admin Access Issues
- **Role Verification**: Check user role in database
- **Route Protection**: Verify middleware implementation
- **Token Validation**: Ensure admin token is valid

## 🚀 Deployment

### Backend Deployment
1. **Environment Variables**: Set production environment variables
2. **Database**: Configure production MongoDB instance
3. **Port Configuration**: Set appropriate port for production
4. **Security**: Enable HTTPS and security headers

### Frontend Deployment
1. **Build Process**: Run `npm run build`
2. **Static Hosting**: Deploy to Vercel, Netlify, or similar
3. **API Configuration**: Update API endpoints for production
4. **Environment Variables**: Configure production settings

### Database Deployment
1. **MongoDB Atlas**: Use cloud database service
2. **Connection String**: Update environment variables
3. **Backup Strategy**: Implement regular backups
4. **Monitoring**: Set up database monitoring

## 🤝 Contributing

### Development Workflow
1. **Fork Repository**: Create personal fork
2. **Feature Branch**: Create branch for new feature
3. **Code Changes**: Implement feature with tests
4. **Pull Request**: Submit PR for review
5. **Code Review**: Address feedback and suggestions

### Code Standards
- **JavaScript**: Follow ES6+ standards
- **React**: Use functional components and hooks
- **API**: Follow RESTful conventions
- **Documentation**: Update README for new features

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**CodeGenix** - [Email](codegenix.eg@gmail.com)


---

*Made with ❤️ for pets & their people. © 2025 CodeGenix* 