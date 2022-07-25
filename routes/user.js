var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')
const Storage = require('../Middleware/multer')

//user middleware
const isVerifyUser = ((req,res,next)=>{
  if (req.session.userLogin) {
    next()
  }
  router.get('/', userController.useHome)
})


//cart middleware
const isVerifyCheckout = ((req, res, next) => {
  if (req.session.userCart) {
      next()
  }else{
      res.redirect('/cart')
  }
  
})


/* GET home page. */
router.get('/', userController.useHome)

router.get('/product',userController.getProducts)


//search products
router.post('/search_product',userController.searchProduct)

//all products
router.get('/all_products',userController.allProducts)

//all search filter
router.post('/search-filter',userController.searchFilter)



// CategoryVise Products
router.get('/category-products/:id',userController.categoryProducts)

router.get('/getCategoryData',userController.getCategoryData)

//product single view
router.get('/product-singleview/:id',userController.singelView)


//cart get method 
router.get('/cart',userController.CartView)


//Add to Whislist
router.post('/add-to-whislist',userController.addToWhislist)

// //add to cart product
// router.get('/add-to-cart/:id',userController.addToCart)
//add to cart product
router.post('/add-to-cart',userController.addToCart)


//romove product from cart
router.post('/delete-cartItem',userController.removeProductCart)

// Change product quantity
router.post('/change-product-quantity',userController.changeProductQuantity)



//Checkout Sample
router.get('/checkout',isVerifyCheckout,userController.checkOut)


//Post method Checkout
router.post('/checkout-product',userController.checkoutProduct)

//User informations changes
router.post('/information_change',userController.changeUserInformations)

//Change User Password
router.post('/changePasswordUser',userController.changeUserPassword)

//Save User Address
router.post('/save-address',userController.saveAddress)

//delete Address
router.get('/delete_address/:id',userController.deleteAddress)

//ship product post method
router.post('/shipProduct',userController.shippProduct)


//Cancel order
router.post('/cancelOrder',userController.cancelOrders) 


//delivered Order
router.post('/deliverdOrder',userController.deliveredOrder)

//user Registration
router.post('/signup',userController.userSignup)

// login post method
router.post('/login',userController.userLogin)

// forgot password user
router.post('/forgot',userController.userForgot)

//Forgot Password Otp
router.post('/otp-forgo-verify',userController.forgotOtpVerify)

//enter a new password
router.post('/forgot-new-password',userController.forgotNewPassword)

//otp method 
router.post('/otp-verify',userController.otpVerify)


//user-profile
router.get('/profile',userController.userProfile)

//update user profile
router.post('/updataUserProfile',Storage.single('profileimages'),userController.updateUserProfile)


//user order list

router.get('/user-order',userController.orderListUser)


// user whislist
router.get('/whislist',userController.userWhislist)

//user success
router.get('/success',userController.success)

//Verify Payment
router.post('/verify-payment',userController.verifyPayments)

// //order-tracking in User
// router.get('/order-tracking/:id/:pId',userController.orderTracking)


//order tracking in user
router.post('/order-tracking',userController.orderTracking)

router.get('/tracking-details',userController.trackingDetails)

// user Logout
router.get('/logout',userController.userLogout)
// router.get('/login',(req,res)=>{
//   res.render('user/use-login',{layout:'user_layout'})
//})
module.exports = router;
