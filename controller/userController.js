const userSchema = require('../model/userModel');
const bcrypt = require('bcrypt');
const saltround = 10;

// Render Register Page
const loadRegister = (req, res) => {
    res.render('user/register');
};

// Render Login Page
const loadLogin = (req, res) => {
    res.render('user/login');
};

// Register User
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email or password is missing
        if (!email || !password) {
            return res.render('user/register', { message: 'Email and Password are required!' });
        }

    
        const user = await userSchema.findOne({ email });
        if (user) {
            return res.render('user/register', { message: 'User already exists!' });
        }

        
        const hashedPassword = await bcrypt.hash(password, saltround);

       
        const newUser = new userSchema({ email, password: hashedPassword });
        await newUser.save();

       
        return res.render('user/login', { message: 'User registered successfully! Please log in.' });

    } catch (error) {
        console.error('Error:', error.message);
        return res.render('user/register', { message: 'Something went wrong. Try again!' });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userSchema.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('user/login', { message: 'Invalid credentials' });
        }

       
        req.session.user=true;
        
        res.redirect('/home');
    } catch (error) {
        console.error('Login error:', error.message);
        res.render('user/login', { message: 'Something went wrong! Please try again later.' });
    }
};

const loadHome = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login'); 
    }
    res.render('user/userHome');
};

const logout = (req, res) => {
    if (req.session) {
        req.session.user = undefined;
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Failed to log out');
            }
            res.redirect('/user/login'); 
        });
    } else {
        res.status(400).send('No session found');
    }
};

module.exports = { 
    registerUser,
    loadRegister,
    loadLogin,
    login,
    loadHome,
    logout
};
