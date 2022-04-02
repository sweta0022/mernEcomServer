const express = require("express");
const router =  express.Router();
const authenticate = require("../midlleware/midlleware"); // Middlewares files

const productController = require('./../controllers/admin/productController');  
const adminController = require('./../controllers/admin/adminController');  

//Product Routes
router.post('/admin/product/new', authenticate, productController.createProduct);
router.route('/admin/product/:id')
      .put(authenticate,productController.updateProduct)
      .delete(authenticate,productController.deleteProduct);
router.put('/updateManyProduct',productController.updateManyProduct);
router.route('/product/:id').get(authenticate,productController.getProductDetail);
router.route('/api/v1/review').put(authenticate, productController.createUpdateReview);
router.route('/api/v1/reviews').get( productController.getProductReviews).delete(authenticate,productController.deleteReviews);

// User Routes   createUpdateReview
router.route('/admin/user/list').get(authenticate,adminController.getAllUser);
router.route('/admin/user/all').get(authenticate,adminController.getAllUser);
router.route('/admin/user/:id')
      .get(authenticate,adminController.getUserDetail)
      .put(authenticate,adminController.updateUserRole)
      .delete(authenticate, adminController.deleteUser);



module.exports = router;