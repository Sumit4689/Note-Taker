require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const port = process.env.PORT || 3000;
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middleware/errorHandler');

connectDb();

const app = express();

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL], // Frontend URLs
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Parse cookies

// Session and Passport middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/users', require('./routes/signupRouter'));
app.use('/api/notes', require('./routes/noteRouter'));

// Root route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Note Taker API" });
});

// Error Handler Middleware
app.use(errorHandler);

app.listen(port, () => {    
    console.log(`Server is running on the port: ${port}`);
    console.log(`http://localhost:${port}`);
});
