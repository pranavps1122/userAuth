const express=require('express')
const router=express.Router();
const userController=require('../controller/userController')
const auth=require('../middleware/auth')



// User-related routes
router.get('/user/register',auth.isLogin, userController.loadRegister);
router.post('/user/register', userController.registerUser);
router.get('/user/login',auth.isLogin, userController.loadLogin); 
router.post('/user/login', userController.login); 
router.get('/user/logout', userController.logout); 
router.get('/home',auth.checkSession,userController.loadHome)
router.get('/logout',userController.logout)







module.exports=router

