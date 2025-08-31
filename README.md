# HD Notes - A Secure Note-Taking Application

HD Notes is a full-stack web application built with React, Node.js, Express, and MongoDB. It offers secure, passwordless authentication with email-based OTP (One-Time Password) and Google OAuth integration.

## Features

- ✅ **Secure Authentication**: Email-based OTP and Google OAuth 
- 📝 **Note Management**: Create, read, update, and delete notes
- 💾 **Persistent Storage**: MongoDB database integration
- 🔒 **JWT Authentication**: Secure access with cookies and token-based auth
- 🎨 **Modern UI**: Built with Tailwind CSS for responsive design
- 🚀 **Optimized Performance**: Vite-powered React frontend

## Project Structure

```
note-taker/
├── backend/              # Node.js + Express backend
│   ├── config/           # Database and authentication configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware (auth, error handling)
│   ├── models/           # Mongoose data models
│   ├── routes/           # API route definitions
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point for the backend
│
└── frontend/             # React frontend
    ├── public/           # Static assets
    ├── src/
    │   ├── assets/       # Images and other assets
    │   ├── components/   # Reusable UI components
    │   ├── context/      # React context providers
    │   ├── pages/        # Page components
    │   └── services/     # API services
    └── index.html        # Entry HTML file
```

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) or a MongoDB Atlas account

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_for_sending_otps
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FRONTEND_URL=http://localhost:5173
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd note-taker
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

#### Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on http://localhost:3000

#### Frontend Server

```bash
cd frontend
npm run dev
```

The frontend development server will start on http://localhost:5173

### Production Build

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
```

This will create an optimized production build in the `dist` directory which can be deployed to a static hosting service.

## Authentication Flow

HD Notes uses two authentication methods:

1. **Email OTP Authentication**:
   - User enters email
   - A 6-digit OTP is sent to the email
   - User verifies with the OTP
   - JWT token is issued and stored in both cookies and localStorage

2. **Google OAuth Authentication**:
   - User clicks "Continue with Google"
   - User authorizes the application through Google
   - User is redirected back with authentication data
   - JWT token is issued and stored in both cookies and localStorage

## API Documentation

The backend provides the following API endpoints:

### Authentication

- `POST /api/users/signup` - Register a new user
- `POST /api/users/verify-otp` - Verify registration OTP
- `POST /api/users/login` - Send login OTP
- `POST /api/users/verify-login-otp` - Verify login OTP
- `GET /api/users/profile` - Get user profile
- `GET /api/users/google` - Google OAuth login
- `GET /api/users/google/callback` - Google OAuth callback
- `POST /api/users/logout` - Logout user

### Notes

- `GET /api/notes` - Get all notes for a user
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Troubleshooting

### Server Connection Issues

If you see a "Server Unavailable" message:
1. Ensure the backend server is running at http://localhost:3000
2. Check MongoDB connection string in the backend `.env` file
3. Verify network connectivity

### Authentication Issues

If experiencing authentication problems:
1. Check browser console for specific error messages
2. Ensure cookies are enabled in your browser
3. Verify that your email provider isn't blocking OTP emails

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Vite](https://vitejs.dev/)
