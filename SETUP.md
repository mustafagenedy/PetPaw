# 🚀 PetPaw Setup Guide

This guide will help you set up the PetPaw project locally and deploy it to GitHub.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **GitHub Account** - [Sign up here](https://github.com/)

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/petpaw.git
cd petpaw
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# MONGODB_URI=mongodb://localhost:27017/petpaw
# JWT_SECRET=your_super_secret_jwt_key_here
# PORT=5000

# Start the server
npm start
```

### 3. Frontend Setup

```bash
# Open new terminal and navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Setup

```bash
# Navigate to server directory
cd server

# Seed the database with demo data
node seed/demo.js
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Default Admin**: admin@petpaw.com / admin123

## 📦 GitHub Deployment

### 1. Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: PetPaw pet grooming platform"

# Add remote repository
git remote add origin https://github.com/yourusername/petpaw.git

# Push to GitHub
git push -u origin main
```

### 2. GitHub Repository Settings

1. **Go to your GitHub repository**
2. **Settings → Pages**
3. **Source**: Deploy from a branch
4. **Branch**: main
5. **Folder**: / (root)

### 3. Environment Variables (for production)

If deploying to platforms like Vercel, Netlify, or Heroku:

**Backend Environment Variables:**
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_production_jwt_secret
PORT=5000
NODE_ENV=production
```

**Frontend Environment Variables:**
```
VITE_API_URL=https://your-backend-url.com
```

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use different secrets for development and production
- Rotate JWT secrets regularly

### 2. Database Security
- Use MongoDB Atlas for production
- Enable network access controls
- Use strong passwords

### 3. API Security
- Enable CORS properly
- Validate all inputs
- Implement rate limiting

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod
```

#### 2. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### 3. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. CORS Issues
- Check if backend is running on correct port
- Verify proxy configuration in vite.config.js
- Ensure CORS middleware is properly configured

## 📱 Testing the Application

### 1. User Registration
1. Go to http://localhost:5173/register
2. Create a new account
3. Verify email and password validation

### 2. Booking System
1. Login to your account
2. Navigate to Booking page
3. Select a service and date
4. Submit booking

### 3. Admin Dashboard
1. Login with admin credentials
2. Access admin dashboard
3. Test booking management
4. Check analytics

### 4. Contact System
1. Send a message via contact form
2. Login as admin to respond
3. Check user dashboard for responses

## 🚀 Production Deployment

### Backend Deployment (Heroku/Vercel/Railway)

1. **Create production build**
2. **Set environment variables**
3. **Configure database connection**
4. **Deploy application**

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to platform**
3. **Configure custom domain**
4. **Set up SSL certificate**

## 📊 Monitoring and Analytics

### 1. Application Monitoring
- Set up error tracking (Sentry)
- Monitor API performance
- Track user analytics

### 2. Database Monitoring
- Monitor MongoDB performance
- Set up alerts for issues
- Regular backup verification

## 🔄 Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd server && npm install
        cd ../client && npm install
        
    - name: Run tests
      run: |
        cd server && npm test
        cd ../client && npm test
```

## 📞 Support

If you encounter any issues:

1. **Check the troubleshooting section above**
2. **Review the README.md file**
3. **Check GitHub Issues**
4. **Contact**: codegenix.eg@gmail.com

---

*Happy coding! 🐾* 