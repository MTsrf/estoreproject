const adminHelper = require('../Helpers/adminHelper')
const userHelper = require('../Helpers/userHelper')
const mongoose = require('mongoose')
const Cart = require('../model/Cart')
const Product = require('../model/Product')
const Sms = require('../config/sms')
const Users = require('../model/User')
const bcrypt = require('bcrypt')
const Order = require('../model/Order')

let filerData = []
let categoryDatas = []
let trackingDetails = []




// user home page
module.exports.useHome = (async (req, res) => {
    let featured = await adminHelper.getFeaturedCategory()
    let products = await adminHelper.getRandomProduct()
    adminHelper.getfrontBanner().then((response) => {
        adminHelper.getCategory().then((allCategory) => {
            console.log(featured);
            res.render('user/index', { layout: 'user_layout', category: allCategory, data: response, product: products, feature: featured, user: req.session.user });
        })
    })



})


//search product
module.exports.searchProduct =(async (req,res)=>{
    
    let {search} = req.body
    console.log("search data -----");
    console.log(search);
    let searchData = await userHelper.searchProduct(search)
    filerData =searchData
    length= searchData.length
    res.json({status:true,len:length})
})



module.exports.categoryProducts = (async (req, res) => {
    const cateId = mongoose.Types.ObjectId(req.params.id)
    console.log(cateId);
    console.log('kitty');
    userHelper.categorywiseProduct(cateId).then((response) => {
            console.log("hai");
            categoryDatas = response
            console.log(response);
            res.json({status:true})
            // res.render('user/categoryproducts', { layout: 'user_layout',brand:brand, data: response, category: allCategory, user: req.session.user })
        
    })

})


module.exports.getCategoryData = (async (req,res)=>{
    filerData = categoryDatas
    console.log('product========================================');
    console.log(filerData);
    res.redirect('/all_products')
    // let brand = await Product.distinct("brand_name")
    // res.render('user/categoryproducts', { layout: 'user_layout',brand:brand,filer:filerData,data:categoryDatas,category:category,user:req.session.user})
})






module.exports.getProducts = (async(req,res)=>{
    userHelper.allProduct().then((product)=>{
        filerData= product
        res.redirect('/all_products')
    })
})

module.exports.allProducts = (async (req,res)=>{
    let brand = await Product.distinct("brand_name")
        adminHelper.getCategory().then((allCategory)=>{
            console.log('product========================================');
            console.log(filerData);
            let length = filerData.length
            res.render('user/allproducts',{layout:'user_layout',filter:filerData,category:allCategory,brand:brand,len:length,user: req.session.user})
        })
    
})


//Search filter
module.exports.searchFilter = (async (req,res)=>{
    console.log(req.body);
    const {category,brand,price,sort} = req.body
    let categoryData = []
    let brandData = []
    console.log(sort);
    for (let i of category){
        if (i != '') {
            categoryData.push({'category':mongoose.Types.ObjectId(i)})
        }
        
    }
    for(let k of brand){
        brandData.push({'brand_name':k})
    }

    if (categoryData.length && brandData.length) {
        userHelper.searchFilterData(categoryData,brandData,price).then((response)=>{
            console.log(response);
            filerData= response
            length = filerData.length
            if (req.body.sort == 'lh') {
                filerData.sort((a, b) => a.price - b.price);
                res.json({ status: true,len:length });
              }
              else if (req.body.sort == 'hl') {
                filerData.sort((a, b) => b.price - a.price);
                res.json({ status: true ,len:length});
              }else{
                res.json({ status: true,len:length });
              }
              
        })
    }else if (categoryData.length == 0 && brandData != 0) {
        userHelper.searchFilterOne(brandData,price).then((response)=>{
            filerData= response
            length = filerData.length
            if (req.body.sort == 'lh') {
                filerData.sort((a, b) => a.price - b.price);
                res.json({ status: true ,len:length});
              }
              else if (req.body.sort == 'hl') {
                filerData.sort((a, b) => b.price - a.price);
                res.json({ status: true,len:length });
              }else{
                res.json({ status: true,len:length });
              }
        })
    }else if (categoryData.length != 0 && brandData == 0) {
        userHelper.searchFilterOne(categoryData,price).then((response)=>{
            filerData= response
            length = filerData.length
            if (req.body.sort == 'lh') {
                filerData.sort((a, b) => a.price - b.price);
                res.json({ status: true,len:length });
              }
              else if (req.body.sort == 'hl') {
                filerData.sort((a, b) => b.price - a.price);
                res.json({ status: true,len:length });
              }else{
                res.json({ status: true,len:length });
              }
        })
    }else{
        userHelper.getAllProducts(price).then((response)=>{
            console.log(response);
            filerData= response
            length = filerData.length
            if (req.body.sort == 'lh') {
                filerData.sort((a, b) => a.price - b.price);
                res.json({ status: true,len:length });
              }
              else if (req.body.sort == 'hl') {
                filerData.sort((a, b) => b.price - a.price);
                res.json({ status: true,len:length });
              }else{
                res.json({ status: true,len:length });
              }
        })
    }
})

//category products




module.exports.shippProduct = ((req, res) => {
    const { oreder, product } = req.body
    console.log(oreder, product);
    userHelper.shippProduct(oreder, product).then((response) => {
        res.json({ status: true })
    })
})



//cancel order
module.exports.cancelOrders = ((req, res) => {
    const { order, product } = req.body
    userHelper.cancelProduct(order, product).then((response) => {
        res.json(response)
    })
})

//delivered order
module.exports.deliveredOrder = ((req,res)=>{
    console.log(req.body);
    const { order , product } = req.body
    userHelper.deliveredOrder(order,product).then((response)=>{
        res.json(response)
    })
})

// userSignup
module.exports.userSignup = ((req, res) => {
    req.session.userData = req.body
    userHelper.userDoUnique(req.session.userData).then((user) => {
        if (!user) {
            Sms.doSms(req.session.userData).then((response) => {
                console.log('hi');
                console.log(response);
                if (!response.valid) {
                    console.log("valid error");
                    res.json({ success: true })
                } else {
                    console.log("signup error");
                    res.json({ success: false })
                }
            })
        } else {
            console.log("user Exist");
            res.json({ existError: true })

        }

    })
})




// OTP verifications
module.exports.otpVerify = ((req, res) => {
    let userData = req.session.userData
    console.log('userData', userData);
    Sms.otpVerify(req.body, req.session.userData).then((response) => {
        if (response.valid) {
            userHelper.userRegister(req.session.userData).then((response) => {
                console.log('response', response);
                req.session.userLogin = true
                req.session.user = response
                req.session.userCart = false
                res.json({ success: true })

            })
        } else {
            res.json({ success: false })
        }
    })
})
// userAuthentication


module.exports.userLogin = ((req, res) => {
    userHelper.doLoginUser(req.body).then((response) => {
        if (response.status) {
            req.session.userLogin = true
            req.session.user = response.user
            valid = true
            res.json({ success: true })
        } else if (response.passErr) {
            req.session.passErr = response.passErr
            res.json({ success: false })
        } else {
            req.session.userErr = true
            res.json({ error: true })
        }
    })


})



//changeUserPassword
module.exports.changeUserPassword = (async (req,res)=>{
    console.log(req.body);
    userId = mongoose.Types.ObjectId(req.session.user._id)
    const {current_password,password}=req.body
    let changePassword = await userHelper.changePasswordUser(userId,current_password,password)
    res.json(changePassword)
})

// userChange informations
module.exports.changeUserInformations = (async(req,res)=>{
    console.log(req.body);
    userId = mongoose.Types.ObjectId(req.session.user._id)
    let changesInfo = await userHelper.changeUserInformations(userId,req.body)
    res.json(changesInfo)
})


//user Forgot method

module.exports.userForgot = (async (req, res) => {
    try {
        const {phone_number}= req.body
        req.session.userForgo = req.body
        let customer = await Users.findOne({phone_number:phone_number})
        if (customer) {
            console.log(req.body);
            let response= await Sms.doSms(req.body)
            console.log(response);
            if (!response.valid) {
                res.json({success:true})
            }else{
                res.json({success:false})
            }
        }else{
            res.json({notExist:true})
        }
        
    } catch (error) {
        
    }
})


// User Otpverify 
module.exports.forgotOtpVerify = (async(req,res)=>{
    try {
        console.log(req.session.userForgo);
        let response = await Sms.otpVerify(req.body,req.session.userForgo)
        if (response.valid) {
            res.json({success:true})
        }else{
            res.json({success:true})
        }
    } catch (error) {
        
    }
})

//forgot set new password
module.exports.forgotNewPassword = (async(req,res)=>{
    try {
        console.log(req.body);
        console.log(req.session.userForgo.password);
        const {password}= req.body
        console.log(password);
        let changePassword = await bcrypt.hash(password,10)
        let setNewPassword = await Users.updateOne(
            { phone_number:req.session.userForgo.phone_number},{
                $set:{
                    password:changePassword
                }
            })
            console.log(setNewPassword);
            res.json({success:true})
    } catch (error) {
        
    }
})

//Addto whislist
module.exports.addToWhislist = ((req, res) => {
    console.log(req.body);
    userId = mongoose.Types.ObjectId(req.session.user._id)
    userHelper.addTowhislist(req.body, userId).then((response) => {
        res.json(response)
    })
})


// products single view
module.exports.singelView = ((req, res) => {
    console.log('single ');
    const viewId = mongoose.Types.ObjectId(req.params.id)
    adminHelper.getCategory().then((category) => {
        userHelper.singleViewProducts(viewId).then((data) => {
            console.log('hi single products');
            console.log(data);
            res.render('user/single-product', { layout: 'user_layout', product: data, category: category, user: req.session.userLogin })
        })
    })
})





//cart view 
module.exports.CartView = ((req, res) => {
    // if(!req.session.cart){

    // }
    userId = mongoose.Types.ObjectId(req.session.user._id)
    console.log('cart view userid');
    console.log(userId);
    userHelper.getCartProducts(userId).then((data) => {
        userHelper.getAllAmount(userId).then((response) => {
            console.log(req.session.userCart);
            res.render('user/cart', { layout: 'cart_layout', datas: data, amount: response })
        })

    })

})







// // add to cart
// module.exports.addToCart=((req,res)=>{
//     prodId = req.params.id
//     userId = mongoose.Types.ObjectId(req.session.user._id)
//     userHelper.addToCart(prodId,userId)

// })

// add to cart
module.exports.addToCart = ((req, res) => {
    if (req.session.userLogin) {
        console.log('hai');
        const { product, price, seller } = req.body
        console.log('seller und');
        console.log(product, price, seller);
        userId = mongoose.Types.ObjectId(req.session.user._id)

        userHelper.addToCart(product, price, seller, userId).then((response) => {
            console.log("add to cat pridfnkdf");
            console.log(response);
            req.session.userCart = true
            res.json({ success: true })
        })
    } else {
        res.json({ success: false })
    }


})


//Change Product Quantity
module.exports.changeProductQuantity = ((req, res) => {
    console.log('controller kitty');
    console.log(req.body);
    userId = mongoose.Types.ObjectId(req.session.user._id)
    userHelper.changeProductQuantity(req.body).then((response) => {
        userHelper.getAllAmount(userId).then((data) => {
            response.data = data
            console.log('ivide data kitti');
            console.log(response);
            res.json(response)
        })

    })
})


//Remove Product from cart
module.exports.removeProductCart = ((req, res) => {
    console.log(req.body);
    userHelper.deleteCartItem(req.body).then((response) => {
        console.log('remove aayo');
        console.log(response);
        req.session.userCart = false
        res.json(response)
    })
})

//Checkout User
module.exports.checkOut =(async (req, res) => {

    userId = mongoose.Types.ObjectId(req.session.user._id)
    let Address = await userHelper.getUserAddress(userId)
    userHelper.getCartProducts(userId).then((data) => {
        userHelper.getAllAmount(userId).then((response) => {
            console.log("checkout kitty");
            console.log(data);
            res.render('user/checkout', { layout: 'userbase_layout', datas: data, total: response ,add:Address })
        })
    })


})

//Save delivery address in user panel

module.exports.saveAddress = (async(req,res)=>{
    userId = mongoose.Types.ObjectId(req.session.user._id)
    console.log(req.body);
    userHelper.saveAddress(req.body,userId).then((response)=>{
        console.log(response);
        res.json(response)
    })
})



//order-tracking in user
module.exports.orderTracking = (async(req,res)=>{
    try {
        console.log(req.body);
        const {order,cart,user,product,address}= req.body
        let trackingProduct = await Order.aggregate([{$unwind:'$products'},{$match:{_id:mongoose.Types.ObjectId(order)}},{
            $match:{'products._id':mongoose.Types.ObjectId(cart)}},{$match:{'products.item':mongoose.Types.ObjectId(product)}},{
            $lookup:{
                from:'products',
                foreignField:'_id',
                localField:'products.item',
                as:'product'
            }  
        },{$unwind:'$product'},{$match:{user:mongoose.Types.ObjectId(user)}},{
            $lookup:{
                from:'users',
                localField:"user",
                foreignField:'_id',
                as:'users'
            }
        },{$unwind:'$users'},{$unwind:'$users.deliveryDetails'},{
            $match:{'users.deliveryDetails._id':mongoose.Types.ObjectId(address)}
        }])
        trackingDetails =trackingProduct
        res.json({success:true})
    } catch (error) {
        
    }
})


//tracking details
module.exports.trackingDetails = (async(req,res)=>{
    try {
        console.log(trackingDetails);
        res.render('user/order-tracking',{layout:'user_layout',data:trackingDetails})
    } catch (error) {
        
    }
})

//delete Deliveery Address
module.exports.deleteAddress = (async(req,res)=>{
    userId = mongoose.Types.ObjectId(req.session.user._id)
    addressId = mongoose.Types.ObjectId(req.params.id)
    console.log(addressId)
    let remove = await userHelper.deleteAddress(userId,addressId)
    res.json(remove)
})


// Checkout product
module.exports.checkoutProduct = (async (req, res) => {
    userId = mongoose.Types.ObjectId(req.session.user._id)
    let products = await userHelper.getCartProductList(userId)
    let amount = await userHelper.getAllAmount(userId)
    console.log("req.body print cheythu");
    console.log(products);
    console.log(req.body);
    userHelper.placeOrder(req.body, userId, products, amount).then((orderId) => {
        if (req.body['payment-method'] === 'COD') {
            console.log('cod paymaent');
            req.session.userCart=false
            res.json({ codSuccess: true })
        } else {
            console.log("orderiD AND AMOUNT");
            console.log(orderId, amount);
            userHelper.generateRazorpay(orderId, amount).then((response) => {
                console.log("razorpay", response);
                req.session.userCart=false
                res.json(response)
            })
        }
    })
})

//verify online payments 
module.exports.verifyPayments = (async (req, res) => {
    userHelper.verifyPayment(req.body).then(() => {
        userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
            res.json({ status: true })
        })
    }).catch((err) => {
        res.json({ status: false })
    })
})


//user profile
module.exports.userProfile = (async (req, res) => {
    userId = mongoose.Types.ObjectId(req.session.user._id)
    let info = await userHelper.getUserInfo(userId)
    let userDetails = await userHelper.getUserDetais(userId)
    let getAddress = await userHelper.getUserAddress(userId)
    adminHelper.getCategory().then((allCategory) => {
        res.render('user/userprofile', { layout: 'user_layout', category: allCategory ,user:userDetails,add :getAddress,infos:info })
    })

})



//update user profile
module.exports.updateUserProfile = (async(req,res)=>{
    console.log(req.body);
    console.log(req.file);
    userId = mongoose.Types.ObjectId(req.session.user._id)
    // userHelper.updataProfile(req.body,req.file,userId).then((response)=>{
    //     res.redirect('/profile')
    // })
    if (req.file == undefined) {
        userHelper.updataProfile(req.body,userId).then((response)=>{
            res.redirect('/profile')
        })
    }else{
        userHelper.updataImageProfile(req.body,req.file,userId).then((response)=>{
            res.redirect('/profile')
        }) 
    }
})

//user order list

module.exports.orderListUser = (async (req, res) => {
    userId = mongoose.Types.ObjectId(req.session.user._id)
    adminHelper.getCategory().then((allCategory) => {
        userHelper.getUserOrder(userId).then((orderList) => {
            console.log('orderLIst');
            console.log(orderList);
            res.render('user/order-user', { layout: 'user_layout', category: allCategory, data: orderList })
        })

    })

})


//user whislist 
module.exports.userWhislist = (async (req, res) => {
    userId = mongoose.Types.ObjectId(req.session.user._id)
    console.log("ivide", userId);
    adminHelper.getCategory().then((allCategory) => {
        userHelper.getAllWhislist(userId).then((data) => {
            res.render('user/whislist', { layout: 'user_layout', category: allCategory, datas: data })
        })

    })

})

//user Suceess
module.exports.success = ((req, res) => {
    res.render('user/order-success', { layout: 'userbase_layout' })
})






//User Logout
module.exports.userLogout = ((req, res) => {
    req.session.userLogin = false
    req.session.user = null
    req.session.user = false
    res.redirect('/')
})