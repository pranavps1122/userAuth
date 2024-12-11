const express = require('express');
const hbs = require('hbs');
const app = express();
const path = require('path');
const connectDB = require('./db/connectDB');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Importing routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const nocache = require('nocache');

// Register the 'add' helper with hbs
hbs.registerHelper('add', function(a, b) {
    return a + b;
});

// Express setup
app.use(express.static('public')); // Serve static files from 'public' folder
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretkey', // Better to use environment variable
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/userAuth',
        ttl: 24 * 60 * 60, // Session TTL (1 day)
        autoRemove: 'native'
    }),
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}));

// Add session data to all views
app.use((req, res, next) => {
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.isAdmin = !!req.session.admin;
    next();
});


app.use(nocache());
// Set view engine and views path
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Use routes for user and admin
app.use('/', userRoutes); // Use '/' as the base path for user routes
app.use('/admin', adminRoutes);

// Connect to the database
connectDB();

// Start the server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/user/login`);
});