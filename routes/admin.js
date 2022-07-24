const express = require('express');
const router = express.Router();
const adminHelprs = require('../Helpers/adminHelper')
const mongoose = require('mongoose')
const sms = require('../config/sms');
const Storage = require('../Middleware/multer')
const Users = require('../model/User')

//session middleware
const isVerifyAdmin=((req,res,next)=>{
  if (req.session.adminLogin) {
    next()
  }else{
    res.redirect('/admin')
  }
})



/* GET users listing. */
router.get('/', function(req, res, next) {
  message = req.session.loginFail
  if (req.session.adminLogin) {
    res.redirect('/admin/admin-panel')
  }else{
    res.render('admin/admin-login',{layout:'admin_layout',admin:false , messages: message,pasErr:req.session.passwErr});
    req.session.loginFail = false;
    req.session.passwErr = false;
  }
});

// Post Method admin login
router.post('/admin-login',(req,res)=>{
  adminHelprs.doAdminLogin(req.body).then((response)=>{
    if (response.status) {
      req.session.adminLogin = true;
      res.redirect('/admin')
    }else if(response.adminErr){
      req.session.loginFail = true;
      res.redirect('/admin')
    }else{
      req.session.passwErr=true
      res.redirect('/admin')
    }
  })
})



//Admin Panel 
router.get('/admin-panel',isVerifyAdmin,async(req,res)=>{
  let total = await Promise.all([
    adminHelprs.totalRevanue(),adminHelprs.totalSales(),
    adminHelprs.activeOrder(),adminHelprs.totalProducts(),
    adminHelprs.totalCustomer(),adminHelprs.totalSellers()])
    res.render('admin/index',{layout:'admin_layout',admin:true,totalRevanue:total[0],sales:total[1],
    active:total[2],totalProduct:total[3],totalCustomers:total[4],totalSeller:total[5]});
})


//category

router.get('/category',isVerifyAdmin,(req,res)=>{
  adminHelprs.getCategory().then((data)=>{
    res.render('admin/category',{layout:'admin_layout',admin:true,data:data,err:req.session.catFail,uniData:req.session.uniqueUpdate});
    req.session.catFail = false
    req.session.uniqueUpdate = false
  }) 
  
})


// add category

router.post('/add-category',isVerifyAdmin,(req,res)=>{
    adminHelprs.doUniqueCategory(req.body).then((response)=>{
      if (!response) {
        console.log("false aano"+response);
        console.log(req.body);
        adminHelprs.addCategory(req.body).then((response)=>{
          if(response){
            console.log("success");
            res.redirect('/admin/category')
          }else{
            console.log("failed");
          }
        
        })
      }else{
        console.log("failed aado");
        req.session.catFail = true;
        res.redirect('/admin/category')
      }
    })
})

// Deleted Category

router.get('/delete-category/:id',isVerifyAdmin,(req,res)=>{
  console.log(req.params.id);
  let catId = mongoose.Types.ObjectId(req.params.id);
  console.log(catId);
  adminHelprs.softDelet(catId).then((response)=>{
    res.redirect('/admin/category')
  })
})







//SEller approve
router.get('/seller-req',isVerifyAdmin,(req,res)=>{
  adminHelprs.getDisableSeller().then((data)=>{
    console.log(data);
    console.log("data kitti");
    res.render('admin/seller-req',{layout:'admin_layout',admin:true,data:data})
  })
  
})



//All seller
router.get('/all-seller',isVerifyAdmin,(req,res)=>{
  adminHelprs.getallSeller().then((response)=>{
    res.render('admin/all-seller',{layout:'admin_layout',admin:true,data:response})
  })
  
})


//Seller Accept
router.get('/accept-seller/:id',isVerifyAdmin,(req,res)=>{
  let acceptId = mongoose.Types.ObjectId(req.params.id)
  console.log(acceptId);
  adminHelprs.doAccept(acceptId).then((response)=>{
    if (response) {
      res.redirect('/admin/seller-req')
    }
  })
})

//Block Seller
router.get('/block-seller/:id',isVerifyAdmin,(req,res)=>{
  const blockId = mongoose.Types.ObjectId(req.params.id)
  console.log(blockId);
  adminHelprs.blockUser(blockId).then((response)=>{
    res.redirect('/admin/category')
  })
})


//unBlock Seller
router.get('/unblock-seller/:id',isVerifyAdmin,(req,res)=>{
  const unBlockId = mongoose.Types.ObjectId(req.params.id)
  adminHelprs.unBlockUser(unBlockId).then((response)=>{
    res.redirect('/admin/category')
  })
})

//admin Update Category

router.post('/update-category/:id',isVerifyAdmin,(req,res)=>{
  let editId = mongoose.Types.ObjectId(req.params.id)
  console.log(editId,req.body);
  adminHelprs.uniqueUpdateCategory(req.body).then((updateData)=>{
    if (!updateData) {
      adminHelprs.updateCategory(editId,req.body).then((response)=>{
        if (response) {
          res.redirect('/admin/category')
        }
      }) 
    }else{
      req.session.uniqueUpdate = true;
      res.redirect('/admin/category')
    }
  })
  
})

//View Products Category vise
router.get('/view-products/:id',isVerifyAdmin,(req,res)=>{
  const viewId = mongoose.Types.ObjectId(req.params.id)
  console.log(viewId);
  adminHelprs.viewCategoryProducts(viewId).then((response)=>{
    res.render('admin/category-viewproducts',{layout:'admin_layout',admin:true,data:response})
  })
})


//All Products 
router.get('/all-products',isVerifyAdmin,(req,res)=>{
  adminHelprs.getAllProductsAdmin().then((response)=>{
    res.render('admin/all-products',{layout:'admin_layout',admin:true,data:response})
  })
})

// Add Banner
router.get('/front-banner',isVerifyAdmin,(req,res)=>{
  adminHelprs.getfrontBanner().then((response)=>{
    res.render('admin/add_frontbanner',{layout:'admin_layout',admin:true,data:response})
  })
  
})

router.post('/adminAddBanner',isVerifyAdmin, Storage.single('BannerImages'), (req,res)=>{
  console.log(req.file);
  adminHelprs.addBanner(req.body,req.file).then((response)=>{
    console.log('response');
    console.log(response);
    res.redirect('/admin/front-banner')
  })
})


//Delete Banner
router.get('/delete-banner/:id',isVerifyAdmin,(req,res)=>{
  delId = mongoose.Types.ObjectId(req.params.id)
  adminHelprs.deleteBanner(delId).then((response)=>{
    res.redirect("/admin/front-banner")
  })
})



//Add category featured
router.get('/featured-category',isVerifyAdmin,(req,res)=>{
  adminHelprs.getFeaturedCategory().then((response)=>{
    res.render('admin/featured-Category',{layout:'admin_layout',admin:true,data:response})
  })
  
})


// post method in featured category
router.post('/featuredCategory',isVerifyAdmin,Storage.single('featuredCategory'),(req,res)=>{
  console.log(req.body);
  console.log(req.file);
  adminHelprs.featuredCategory(req.body,req.file).then((response)=>{
    res.redirect("/admin/featured-category")
  })

})


//delete featured category
router.get('/delete-feature/:id',isVerifyAdmin,(req,res)=>{
  delId = mongoose.Types.ObjectId(req.params.id)
  adminHelprs.deleteFeature(delId).then((data)=>{
    res.redirect('/admin/featured-category')
  })
})


//Orders in AdminPanel
router.get('/all-orders',isVerifyAdmin,async(req,res)=>{
  let sellersOrder = await adminHelprs.sellersOrder()
  console.log(sellersOrder);
  res.render('admin/all_orders',{layout:'admin_layout',admin:true,allOrder:sellersOrder})
})


//Completed Orders in Admin panel
router.get('/complete-orders',isVerifyAdmin,async(req,res)=>{
  let completeOrder = await adminHelprs.completeOrder()
  res.render('admin/compelete_order',{layout:'admin_layout',admin:true,allOrder:completeOrder})
})

//pending and cancel order in admin panel
router.get('/pending-orders',isVerifyAdmin,async(req,res)=>{
  let pendingOrder = await adminHelprs.pendingOrders()
  res.render('admin/pending_orders',{layout:'admin_layout',admin:true,allOrder:pendingOrder})
})


//All users admin Panel
router.get('/all-users',isVerifyAdmin,async(req,res)=>{
  let allUsers = await Users.find({}).lean()
  console.log(allUsers);
  res.render('admin/all_users',{layout:'admin_layout',admin:true,all:allUsers})
})


// Block User
router.get('/block-user/:id',isVerifyAdmin,async(req,res)=>{
  try {
    let blockId = mongoose.Types.ObjectId(req.params.id)
    let userblock = await Users.updateOne({_id:blockId},{$set:{isBlocked:true}})
    res.redirect('/admin/all-users')
  } catch (error) {
    
  }
})

//Un block User
router.get('/unblock-user/:id',isVerifyAdmin,async(req,res)=>{
  try {
    let unBlockId = mongoose.Types.ObjectId(req.params.id)
    let unBlock = await Users.updateOne({_id:unBlockId},{$set:{isBlocked:false}})
    res.redirect('/admin/all-users')
  } catch (error) {
    
  }
})


// 
//Admin logout
router.get('/admin-logout',(req,res)=>{
  req.session.adminLogin = false;
  res.redirect('/admin')
})
module.exports = router;
