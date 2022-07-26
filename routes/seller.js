var express = require('express');
const mongoose = require('mongoose')
const Sms = require('../config/sms');
const adminHelper = require('../Helpers/adminHelper');
var router = express.Router();
var sellerHelper = require('../Helpers/sellerHelper')
const Storage = require('../Middleware/multer')

let datas = [];

const isVerifySeller = ((req, res, next) => {
  if (req.session.sellerLogin) {
    next()
  } else {
    res.redirect('/seller')
  }
})



/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.sellerLogin) {
    res.redirect('/seller/home')
  } else {
    res.render('seller/seller-login', { layout: 'seller_layout', passErr: req.session.passwErr, sellerErr: req.session.sellerError });
    req.session.passwErr = false;
    req.session.sellerError = false;
  }
});


// Seller Registraion

router.get('/seller-signup', (req, res) => {
  res.render('seller/seller-signup', { layout: 'seller_layout', existError: req.session.existError })
  req.session.existError = false;
})

// post method signup
router.post('/seller-signup', (req, res) => {
  req.session.sellerData = req.body

  console.log(req.session.sellerData);
  sellerHelper.doUnique(req.session.sellerData).then((seller) => {
    if (!seller) {
      Sms.doSms(req.session.sellerData).then((response) => {
        if (!response.valid) {
          console.log("success gifsd" + response.valid)
          res.redirect('/seller/otp-verify')

        } else {

          console.log('otp failed redirect' + response.valid);
          res.redirect('/seller/seller-signup')

        }
      })
    } else {
      req.session.existError = true;
      console.log('user exist erroe' + seller);
      res.redirect('/seller/seller-signup')
    }
  })
})

// seller otp verify
router.get('/otp-verify', (req, res) => {
  console.log(req.session.sellerData);
  res.render('seller/otp-verify', { layout: 'seller_layout' })
})

router.post('/otp-verify', (req, res) => {
  console.log(req.body, req.session.sellerData);
  Sms.otpVerify(req.body, req.session.sellerData).then((response) => {
    console.log("enik kitt" + response.valid);
    if (response.valid) {
      sellerHelper.sellerRegister(req.session.sellerData).then((response) => {
        console.log(response);
        res.redirect('/seller/sellerSignup-response')
      })
    } else {
      res.redirect('/seller/otp-verify')
    }
  })
})



//signup after response page

router.get('/sellerSignup-response', (req, res) => {
  res.render('seller/seller-response', { layout: 'seller_layout' })
})



//Seller Login
router.post('/seller-login', (req, res) => {
  console.log(req.body);
  sellerHelper.doLoginSeller(req.body).then((response) => {
    if (response.status) {
      req.session.sellerLogin = true;
      req.session.seller = response.seller;
      res.redirect('/seller')
    } else if (response.passwErr) {
      req.session.passwErr = true;
      res.redirect('/seller')
    } else {
      req.session.sellerError = true;
      res.redirect('/seller')
    }
  })

})


//Enter home page
router.get('/home',async (req, res) => {
  if (req.session.sellerLogin) {
    let sellerId = mongoose.Types.ObjectId(req.session.seller._id)
    let totalRevenues = await sellerHelper.totalRevenue(sellerId)
    let totalSales = await sellerHelper.totalSales(sellerId)
    let activeOrders = await sellerHelper.activeOrders(sellerId)
    let totalproducts = await sellerHelper.totalProdcut(sellerId)
    let totalorder = await sellerHelper.totalOrders(sellerId)
    let cancelOrder = await sellerHelper.cancelOrder(sellerId)
    let pendingOrder = await sellerHelper.pendingOrder(sellerId)
    // let total = await Promise.all([])
    res.render('seller/index', { layout: 'seller_layout', sel: true, seller: req.session.seller ,totalRevenue:totalRevenues,
    sale:totalSales,order:activeOrders,product:totalproducts,totalOrders:totalorder,cancel:cancelOrder,pending:pendingOrder})
  } else {
    res.redirect('/seller')
  }
})




// forgot password
router.get('/forgot', (req, res) => {
  res.render('seller/seller-forget', { layout: 'seller_layout' })
})

//forgot post method

router.post('/forgot', (req, res) => {
  req.session.forgotNumber = req.body
  sellerHelper.doUnique(req.body).then((seller) => {
    if (seller) {
      Sms.doSms(req.session.forgotNumber).then((response) => {

      })
    }
  })
})





//add products

router.get('/add-products', isVerifySeller, (req, res) => {
  adminHelper.getCategory().then((allCategory) => {
    res.render('seller/add-products', { layout: 'seller_layout', sel: true, all: allCategory })
  })

})

//add post method
router.post('/add-products', isVerifySeller, Storage.array('productImages', 4), (req, res) => {
  console.log('ready');
  let img = []
  if (req.files.length > 0) {
    img = req.files.map(file => {
      return file.filename
    })
  }
  console.log(img);
  console.log(req.body);
  sellerData = req.session.seller;

  sellerHelper.addProduct(req.body, sellerData, img).then((response) => {
    console.log(response);
    console.log('success');
    res.redirect('/seller/add-products')
  }).catch((err) => {
    console.log('error' + err);
  })
})



//all products
router.get('/all-products', isVerifySeller, (req, res) => {
  sellerID = req.session.seller
  id = mongoose.Types.ObjectId(sellerID._id)
  console.log("id" + id);
  sellerHelper.getAllProducts(id).then((response) => {
    console.log("ithe");
    console.log(response);
    res.render('seller/all-products', { layout: 'seller_layout', sel: true, data: response })
  })

})

//delete Products

router.get('/delete-products/:id', isVerifySeller, (req, res) => {
  const delId = mongoose.Types.ObjectId(req.params.id)
  console.log(delId);
  sellerHelper.deleteProducts(delId).then((response) => {
    console.log(response);
    res.redirect('/seller/all-products')
  })
})


//new orders
router.get('/new-orders', isVerifySeller, (req, res) => {
  sellerId = mongoose.Types.ObjectId(req.session.seller._id)
  console.log(sellerId);
  sellerHelper.getOrders(sellerId).then((response) => {
    res.render('seller/new-orders', { layout: 'seller_layout', sel: true ,data:response})

  })
})

// singleview products
router.post('/single_order',isVerifySeller,(req,res)=>{
  console.log(req.body)
  const {order,product,address} = req.body
  sellerId = mongoose.Types.ObjectId(req.session.seller._id)
  sellerHelper.singleViewOrders(order,product,address,sellerId).then((response)=>{
    console.log(response)
    datas = response
    res.json({status:true})
  })
  
})

router.get('/singelOrderView',isVerifySeller,(req,res)=>{
  console.log('++++++++++++++++++++++++++++++++++');
  console.log(datas);

  res.render('seller/singleorder',{layout: 'seller_layout', sel: true ,data:datas})
})





//seller chat
router.get('/chat',isVerifySeller,async(req,res)=>{
  sellerID = req.session.seller
  id = mongoose.Types.ObjectId(sellerID._id)
  console.log(id);
  let sellerData = await sellerHelper.getSeller(id)
  res.render('seller/chat',{layout:'seller_layout',sel:true,data:sellerData})
})

//logout seller
router.get('/seller-logout', (req, res) => {
  req.session.sellerLogin = false;
  res.redirect('/seller')
})



module.exports = router;

