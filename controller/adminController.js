const adminModel = require('../model/adminModel');
const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const { log } = require('handlebars');


const loadLogin = async (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');  
    }
    res.render('admin/login');  
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminModel.findOne({ email });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.render('admin/login', { message: 'Invalid Credentials' });
        }

        
        req.session.admin = {
            id: admin._id,
            email: admin.email,
            loginTime: new Date()
        };
        
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).send("Internal Server Error");
    }
};


const loadDashboard = async (req, res) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin/login');  
        }

        const search = req.query.search || '';
        const query = search
            ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
            : {};

        const users = await userModel.find(query);  
        res.render('admin/dashboard', { users, search }); 

      
    } catch (error) {
        console.error("Error loading dashboard:", error.message);
        res.status(500).send("Internal Server Error");
    }
};

const loadAddUser = (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');  
    res.render('admin/addUser');  
};


const addUser = async (req, res) => {
    try {
        const { email, password } = req.body;

    
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
         
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({ email, password: hashedPassword });

      
        return res.status(200).json({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.error('Error adding user:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



const loadEditUser = async (req, res) => {
    try {
        if (!req.session.admin) return res.redirect('/admin/login'); 
        const user = await userModel.findById(req.params.id);  
        res.render('admin/editUser', { user });  
    } catch (error) {
        console.error("Error loading edit user page:", error.message);
        res.status(500).send("");
      
    }
};

const updateUser = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.params.id;

       
        const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });
        
        if (existingUser) {
         
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        await userModel.findByIdAndUpdate(userId, { email });
        
        res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const deleteUser = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);  
        res.redirect('/admin/dashboard');  
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).send("Internal Server Error");
    }
};


const logout = async (req, res) => {
    req.session.destroy((err) => {  
        if (err) {
            console.error("Error during session destruction:", err);
        }
        res.redirect('/admin/login'); 
    });
};


module.exports = {
    loadLogin,
    login,
    loadDashboard,
    loadAddUser,
    addUser,
    loadEditUser,
    updateUser,
    deleteUser,
    logout
};
