const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const adminAuth = require('../middleware/adminAuth');

// Admin login routes
router.get('/login', adminAuth.isLogin, adminController.loadLogin);
router.post('/login', adminController.login);

// Dashboard route
router.get('/dashboard', adminAuth.checkSession, adminController.loadDashboard);

// Add User
router.get('/addUser', adminAuth.checkSession, adminController.loadAddUser);
router.post('/addUser', adminAuth.checkSession, adminController.addUser);

// Edit User
router.get('/editUser/:id', adminAuth.checkSession, adminController.loadEditUser);
router.post('/editUser/:id', adminAuth.checkSession, adminController.updateUser);

// Delete User
router.get('/deleteUser/:id', adminAuth.checkSession, adminController.deleteUser);

// Logout
router.get('/logout', adminController.logout);

module.exports = router;