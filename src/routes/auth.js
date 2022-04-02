const express = require("express");
const router =  express.Router();
const authenticate = require("../midlleware/midlleware"); // Middlewares files

const AuthController = require('./../controllers/authController');
const WelcomeController = require('./../controllers/welcomeController');

router.get( '/', ( req , res ) => {
    res.send('How are you from router folder');
} );

router.post('/api/v1/signup', AuthController.signup);
router.post('/api/v1/signin', AuthController.signin);
router.post('/password/forget', AuthController.forget_password);
router.put('/api/v1/password/reset/:token', AuthController.resetPassword);
router.get('/api/v1/logout',authenticate, AuthController.logout);

// User Routes
router.get('/api/v1/getUserDetail',authenticate, WelcomeController.getUserDetail);
router.put('/api/v1/password/update',authenticate, WelcomeController.updateUserPassword);
router.put('/api/v1/user/updateProfile',authenticate, WelcomeController.updateUserProfile);

router.post('/contactus', authenticate, WelcomeController.contactus);
router.get('/getFeatureProduct', WelcomeController.getFeatureProduct);
router.get('/api/v1/getAllProducts', WelcomeController.getAllProduct);
router.get('/api/v1/getProductDetail/:id', WelcomeController.getProductDetail);


module.exports = router;