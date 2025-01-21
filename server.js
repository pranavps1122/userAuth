const express = require('express');
const hbs = require('hbs');
const app = express();
const path = require('path');
const connectDB = require('./db/connectDB');
const session = require('express-session');
const MongoStore = require('connect-mongo');


const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const nocache = require('nocache');


hbs.registerHelper('add', function(a, b) {
    return a + b;
});


app.use(express.static('public')); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/userAuth',
        ttl: 24 * 60 * 60, 
        autoRemove: 'native'
    }),
    cookie: { 
        maxAge: 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}));


app.use((req, res, next) => {
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.isAdmin = !!req.session.admin;
    next();
});


app.use(nocache());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use('/', userRoutes); 
app.use('/admin', adminRoutes);


connectDB();


const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/user/register`);
    console.log(`Server running on http://localhost:${PORT}/admin/login`);
});
