# HD Notes Development Guide

This document contains more detailed information for developers working on the HD Notes application.

## Local Development Setup

### Prerequisites

- Node.js v16+ and npm
- MongoDB (local or Atlas)
- Git
- VS Code (recommended) or another code editor

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code

## Detailed Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd note-taker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Backend Environment Variables

Create a `.env` file in the backend directory with these variables:

```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/note-taker?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Notes:
- For Gmail, you'll need to create an App Password in your Google Account settings
- For MongoDB Atlas, create a cluster and get the connection string
- For Google OAuth, set up credentials in the Google Cloud Console

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Development Workflow

### Running the Application

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

### Development Notes

- Backend runs on port 3000
- Frontend runs on port 5173
- MongoDB connection issues? Check your connection string and network
- Email service not working? Verify credentials and check spam folder

## Application Architecture

### Backend Architecture

```
backend/
├── config/              # Configuration
│   ├── dbConnection.js  # MongoDB connection
│   └── passport.js      # Passport.js (Google OAuth)
├── controllers/         # Route handlers
│   ├── noteController.js
│   └── signupController.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js
│   └── validateTokenHandler.js
├── models/              # Mongoose models
│   ├── noteModel.js
│   └── userModel.js
├── routes/              # API routes
│   ├── noteRouter.js
│   └── signupRouter.js
├── utils/               # Utilities
│   └── emailService.js  # Email sending service
└── server.js            # App entry point
```

### Frontend Architecture

```
frontend/
├── public/              # Static files
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # Reusable components
│   │   ├── Logo.jsx
│   │   ├── MainLayout.jsx
│   │   └── PrivateRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── pages/           # Page components
│   │   ├── AuthCallbackPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   ├── services/
│   │   └── api.js       # API service
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
└── tailwind.config.js   # Tailwind configuration
```

## Authentication Flow

### Email OTP Authentication Flow

1. User enters email in signup/login form
2. Backend generates a 6-digit OTP and stores it with the user
3. OTP is sent to the user's email
4. User enters OTP for verification
5. If OTP is valid, a JWT token is issued
6. JWT is stored both in cookies and localStorage for redundancy
7. User is redirected to dashboard

### Google OAuth Flow

1. User clicks "Continue with Google"
2. User is redirected to Google's consent screen
3. Upon approval, Google redirects back to our callback URL
4. Backend verifies the authentication and creates/finds the user
5. JWT token is issued and stored
6. User is redirected to dashboard

## JWT Cookie Implementation

The application uses both cookie-based and localStorage token storage:

```javascript
// Backend: Setting JWT in cookie
res.cookie('jwt', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',
    path: '/'
});
```

```javascript
// Frontend: Token syncing
const localToken = localStorage.getItem('token');
const cookieToken = getCookie('jwt');
const token = localToken || cookieToken;

if (cookieToken && !localToken) {
    localStorage.setItem('token', cookieToken);
}
```

## Data Models

### User Model

```javascript
{
    name: String,
    email: String,
    isEmailVerified: Boolean,
    authMethod: String, // 'email' or 'google'
    googleId: String,   // For Google OAuth users
    otp: {              // For email auth
        code: String,
        expiry: Date
    },
    createdAt: Date,
    updatedAt: Date
}
```

### Note Model

```javascript
{
    user: ObjectId,     // Reference to User
    title: String,
    content: String,
    color: String,      // Note color
    isPinned: Boolean,  // Whether note is pinned
    tags: [String],     // Array of tags
    createdAt: Date,
    updatedAt: Date
}
```

## Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

## Building for Production

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

The frontend build artifacts will be in the `dist` directory, ready for deployment to a static hosting service.

## Deployment Recommendations

- Backend: Heroku, AWS Elastic Beanstalk, or Digital Ocean
- Frontend: Netlify, Vercel, or AWS S3 + CloudFront
- Database: MongoDB Atlas (cloud)
- Consider setting up CI/CD with GitHub Actions

## Common Issues and Solutions

### CORS Issues
If experiencing CORS problems during development:
```javascript
// In backend/server.js
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
```

### JWT Not Being Set in Cookie
Check that:
1. Backend is setting cookie properly
2. `withCredentials: true` is set in Axios
3. Frontend and backend are on same domain or properly configured for CORS

### MongoDB Connection Issues
1. Check connection string
2. Ensure IP whitelist in MongoDB Atlas includes your IP
3. Verify network connectivity

## Performance Optimization

- Use React.memo for frequently re-rendered components
- Implement pagination for notes list
- Use proper indexing in MongoDB
- Consider implementing server-side caching
