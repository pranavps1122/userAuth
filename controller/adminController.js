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
            email: admin.email
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
            ? { $or: [{ name: { $regex: search, $options: 'i' } }] }
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
        const { email, password,name } = req.body;

    
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            
         return res.json({ success: false, message: 'User already exists' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({ email, password: hashedPassword ,name:name});

        console.log(
            `username:${name}
            email:${email} 
            Password ${hashedPassword}`);
        
        return res.json({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.error('Error adding user:', error.message);
        res.json({ success: false, message: 'Internal Server Error' });
    }
};



const loadEditUser = async (req, res) => {
    try {
        if (!req.session.admin) return res.redirect('/admin/login'); 
        const user = await userModel.findById(req.params.id);  
        res.render('admin/editUser', { user });  
    } catch (error) {
        console.error("Error loading edit user page:", error.message);
       
      
    }
};

const updateUser = async (req, res) => {
    try {
        const { email ,name } = req.body;
        const userId = req.params.id;

       
        const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });

        
        if (existingUser) {
         
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        await userModel.findByIdAndUpdate(userId, { email ,name});
        
        res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error.message);
        
    }
};



const deleteUser = async (req, res) => {

    try {
        const userId=req.params.id
        await userModel.findByIdAndDelete(userId);  
        if(req.session&&req.session.user&&req.session.user._id===userId)
            req.session.destroy()
        res.redirect('/admin/dashboard');  
    } catch (error) {
        console.error("Error deleting user:", error.message);
 
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

const searchUser = async (req, res) => {
    try {
        const searchQuery = req.query.query.trim();
        if (!searchQuery) {
            return res.json([]); 
        }

        
        const users = await userModel.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        }).exec();

      
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).send('Error searching users');
    }
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
    logout,
    searchUser,
 
    
};
