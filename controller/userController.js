const userSchema = require('../model/userModel');
const bcrypt = require('bcrypt');
const saltround = 10;



const loadRegister = (req, res) => {
    res.render('user/register');
};


const loadLogin = (req, res) => {
    res.render('user/login');
};


const registerUser = async (req, res) => {
    try {
        const { email, password ,name} = req.body;

    
        if (!email || !password||!name ) {
            return res.render('user/register', { message: 'Email and Password are required!' });
        }

    
        const user = await userSchema.findOne({ email });
        if (user) {
            return res.render('user/register', { message: 'User already exists!' });
        }

        
        const hashedPassword = await bcrypt.hash(password, saltround);

       
        const newUser = new userSchema({ email, password: hashedPassword ,name});
        await newUser.save();

        console.log(
            `username : ${name} 
            email: ${email} 
            password:${hashedPassword}`);
           
         
        
  
    return res.render('user/login',{ok:'User Created Sucessfully'})
  


    } catch (error) {
        console.error('Error:', error.message);
        return res.render('user/register', { message: 'Something went wrong. Try again!' });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userSchema.findOne({ email });
        if(email===""||password===''){
            return res.render('user/login', { message: 'Please Enter All fileds' });

        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('user/login', { message: 'Invalid credentials' });
        }
       
        req.session.user={email:user.email , name:user.name}
        
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
    console.log('user',req.session.user);
    
    res.render('user/userHome', { detials: req.session.user.email});

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
    logout,
    
};
