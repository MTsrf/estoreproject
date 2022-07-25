const products = require('../model/Product')
const Users = require('../model/User')
const bcrypt = require('bcrypt')
const Cart = require('../model/Cart')
const mongoose = require('mongoose')
const Order = require('../model/Order')
const Razorpay = require('razorpay')
const flash = require('flash')
require('dotenv').config()

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});



module.exports = {
    categorywiseProduct: (catId) => {
        return new Promise(async (resolve, reject) => {
            const getallproducts = await products.aggregate([{ $match: { category: catId, isDeleted: false } }, {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 0,
                        }
                    }],
                    as: 'category',
                }
            },
            { $unwind: '$category' }, { $match: { 'category.isDeleted': false } }, {
                $lookup: {
                    from: 'sellers',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'seller',
                }
            }, { $unwind: "$seller" }, { $match: { 'seller.isVerified': true, 'seller.isBlocked': false } }, {
                $project: {
                    Images: 1,
                    product_name: 1,
                    price: 1,
                    seller: 1,
                }
            }])
            console.log('ahi');
            console.log(getallproducts);
            resolve(getallproducts)
        })
    },searchProduct:(search)=>{
        return new Promise(async(resolve,reject)=>{
            products.aggregate([{$match:{isDeleted:false}},{
                $lookup:{
                    from:'categories',
                    localField:'category',
                    foreignField:'_id',
                    as:'category'
                }
            },{$unwind:'$category'},{$match:{'category.isDeleted':false}},{
                $lookup:{
                    from:'sellers',
                    localField:'seller',
                    foreignField:'_id',
                    as:'seller'
                }
            },{$unwind:'$seller'},{$match:{'seller.isBlocked':false}},{
                $match:{$or:[{product_name:{$regex:search,$options:'i'}},{'category.category':{$regex:search,$options:'i'}},
                {brand_name:{$regex:search,$options:'i'}}]}
            }]).then((response)=>{
                console.log('search data===============');
                console.log(response);
                resolve(response)
            })
        })
    },allProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            const all_products = await products.aggregate([{$match:{isDeleted:false}},{
                $lookup:{
                    from:'categories',
                    localField:'category',
                    foreignField:'_id',
                    as:'category'
                }
            },{$unwind:'$category'},{$match:{'category.isDeleted':false}},{
                $lookup:{
                    from:'sellers',
                    localField:'seller',
                    foreignField:'_id',
                    as:'seller'
                }
            },{$unwind:'$seller'},{$match:{'seller.isBlocked':false}}])
            console.log(all_products);
            resolve(all_products)
        })

    },
    getAllProducts:(price)=>{
        amount = parseInt(price)
        return new Promise(async(resolve,reject)=>{
            const allproduct = await products.aggregate([{ $match: { isDeleted: false } },{$match:{price:{$lte:amount}}}])
            console.log(allproduct);
            resolve(allproduct)
        })
    },
    searchFilterData:(category,brand,price)=>{
        amount = parseInt(price)
        console.log('filter data');
        console.log(category,brand);
        return new Promise(async (resolve,reject)=>{
            products.aggregate([{
                $match:{isDeleted:false}
            },{
                $match:{$or:category}
            },{
                $match:{
                    $or:brand
                }
            },{$match:{price:{$lte:amount}}},{
                $lookup:{
                    from:'categories',
                    localField:'category',
                    foreignField:'_id',
                    as:'category'
                }
            },{$unwind:'$category'},{$match:{'category.isDeleted':false}},{
                $lookup:{
                    from:'sellers',
                    localField:'seller',
                    foreignField:'_id',
                    as:'seller'
                }
            },{$unwind:'$seller'},{$match:{'seller.isBlocked':false}}]).then((response)=>{
                console.log("kitty data");
                console.log(response);
                resolve(response)
            })
        })
    },searchFilterOne:(data,price)=>{
        amount = parseInt(price)
        return new Promise(async (resolve,reject)=>{
            
            products.aggregate([{
                $match:{isDeleted:false}},{
                    $match:{
                        $or:data
                    }
            },{$match:{price:{$lte:amount}}},{
                $lookup:{
                    from:'categories',
                    localField:'category',
                    foreignField:'_id',
                    as:'category'
                }
            },{$unwind:'$category'},{$match:{'category.isDeleted':false}},{
                $lookup:{
                    from:'sellers',
                    localField:'seller',
                    foreignField:'_id',
                    as:'seller'
                }
            },{$unwind:'$seller'},{$match:{'seller.isBlocked':false}}]).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },singleViewProducts: (viewId) => {
        return new Promise(async (resolve, reject) => {
            const singleProduct = await products.aggregate([{
                $match: { _id: viewId, isDeleted: false }
            }, {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 0,
                        }
                    }],
                    as: 'category',
                }
            }, { $unwind: '$category' }, { $match: { 'category.isDeleted': false } }, { $unwind: '$Images' }, {
                $lookup: {
                    from: 'sellers',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'seller',
                }
            }, { $unwind: "$seller" }, { $match: { 'seller.isVerified': true, 'seller.isBlocked': false } }, {
                $project: {
                    Images: '$Images.productImg',
                    product_name: 1,
                    price: 1,
                    desciptions: 1,
                    brand_name: 1,
                    stock: 1,
                    created_at: 1,
                    category: 1,
                    seller: 1,
                }
            }

            ])
            resolve(singleProduct)
        })
    }, userDoUnique: (uniqueId) => {
        return new Promise(async (resolve, reject) => {
            let user = await Users.findOne({ phone_number: uniqueId.phone_number })
            resolve(user)
        })
    }, userRegister: (regiData) => {
        return new Promise(async (resolve, reject) => {
            let info={
                bio:regiData.full_name,
                dob:"DOB",
                country:"india"
            }
            regiData.password = await bcrypt.hash(regiData.password, 10)
            const regi = await Users.create({
                full_name: regiData.full_name,
                email: regiData.email,
                phone_number: regiData.phone_number,
                password: regiData.password,
                isBlocked: false,
                info:[info]
            }).then((response) => {
                resolve(response)
            })
        })
    },changePasswordUser:(user,current_password,newpassword)=>{
        return new Promise(async (resolve,reject)=>{
            let changePassword = await bcrypt.hash(newpassword,10)
            console.log(changePassword);
            let userdata = await Users.findOne({_id:user,isBlocked:false})
            console.log(userdata);
            if (userdata) {
                bcrypt.compare(current_password, userdata.password).then((status)=>{
                    if (status) {
                        
                        Users.updateOne({_id:user},{
                            $set:{
                                password:changePassword
                            }
                        }).then((response)=>{
                            resolve({status:true})
                        })
                    }else{
                        resolve({status:false})
                    }
                })
                
            }
        })
    }, doLoginUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await Users.findOne({ phone_number: userData.phone_number, isBlocked: false })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log(status);
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        response.status = false
                        response.passErr = true
                        resolve(response)
                    }
                })
            } else {
                response.status = false
                response.userErr = true
                resolve(response)
            }
        })
        // },addToCart:(prodId,userId)=>{
        //     let pro = mongoose.Types.ObjectId(prodId)
        //     let proObj = {
        //         item:pro,
        //         quantity:1
        //     }

        //     // console.log(userId);
        //     // console.log('hai')
        //     return new Promise(async(resolve,reject)=>{
        //         let cart = await Cart.findOne({ userId });
        //         console.log('ivide und');
        //         console.log(cart);
        //         if (cart) {
        //             console.log(prodId);
        //             let itemIndex = cart.products.findIndex(p => p.item == prodId);
        //             console.log('undo');
        //             console.log(itemIndex);
        //             if (itemIndex!=-1) {
        //                 let items = await Cart.findOneAndUpdate({user:mongoose.Types.ObjectId(userId),'products.item':mongoose.Types.ObjectId(prodId)},{
        //                     $inc:{'products.$.quantity':1}
        //                 }).exec()
        //                 console.log(items);
        //                 resolve(items)
        //             }else{
        //                 Cart.updateOne({user:userId},{
        //                     $push:{
        //                         products:[proObj]
        //                     }
        //                 }).then((response)=>{
        //                     console.log(response);
        //                     console.log('update');
        //                     resolve(response)
        //                 })
        //             }

        //         }else{
        //             Cart.create({
        //                 user:userId,
        //                 products:[proObj]
        //             }).then((response)=>{
        //                 console.log(response);
        //                 console.log('add');
        //                 resolve(response)
        //             })
        //         }
        //     })
        // }
    },changeUserInformations:(userId,data)=>{
        infoId= mongoose.Types.ObjectId(data.id)
        return new Promise(async(resolve,reject)=>{
            Users.updateOne({_id:userId,'info._id':infoId},{
                $set:{
                    'info.$.bio':data.bioinf,'info.$.dob':data.dobs,'info.$.country':data.countrys
                }
            }).then((response)=>{
                resolve({status:true})
            })
        })

    },getUserInfo:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            Users.aggregate([{$match:{
                _id:userId,isBlocked:false
            }},{$unwind:'$info'},{$project:{
                _id:0,
                info:1,
                phone_number:1
            }}]).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    }, addToCart: (prodId, price, sellerId, userId) => {
        console.log("add to Cart");
        console.log(userId);
        let pro = mongoose.Types.ObjectId(prodId)
        let amount = parseInt(price)
        let proObj = {
            item: pro,
            quantity: 1,
            price: amount,
            placed:true,
            productStatus:"Palced",
            ship:false,
            cancel:false,
            completed:false,
        }

        // console.log(userId);
        // console.log('hai')
        return new Promise(async (resolve, reject) => {
            let cart = await Cart.findOne({user: userId });
            console.log('ivide und');
            console.log(cart);
            if (cart) {
                console.log(prodId);
                let itemIndex = cart.products.findIndex(p => p.item == prodId);
                console.log('undo');
                console.log(itemIndex);
                if (itemIndex != -1) {
                    let items = await Cart.findOneAndUpdate({ user: mongoose.Types.ObjectId(userId), 'products.item': mongoose.Types.ObjectId(prodId) }, {
                        $inc: { 'products.$.quantity': 1, 'products.$.price': amount }
                    }).exec()
                    console.log(items);
                    resolve(items)
                } else {
                    Cart.updateOne({ user: userId }, {
                        $push: {
                            products: [proObj]
                        }
                    }).then((response) => {
                        console.log(response);
                        console.log('update');
                        resolve(response)
                    })
                }

            } else {
                Cart.create({
                    user: userId,
                    products: [proObj]
                }).then((response) => {
                    console.log(response);
                    console.log('add');
                    resolve(response)
                })
            }
        })
    }, getCartProducts: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cartItems = await Cart.aggregate([{
                $match: { user: userId }
            }, {
                $unwind: '$products'
            }, {

                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity',
                    price: '$products.price',
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $project: {
                    item: 1, quantity: 1, price: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }
                // {
                //     $lookup:{
                //         from:'products',
                //         let:{prodList:'$product'},
                //         pipeline:[
                //             {
                //                 $match:{
                //                     $expr:{
                //                         $in:['$_id','$$prodList']
                //                     }
                //                 }
                //             }
                //         ],
                //         as:'cartItems'
                //     }
                // },
                // {
                //     $unwind:'$cartItems'
                // }
            ])
            console.log('ivide');
            console.log(cartItems);
            resolve(cartItems)
        })
    }, changeProductQuantity: (data) => {
        var count = parseInt(data.count)
        var quantity = parseInt(data.quantity)

        return new Promise(async (resolve, reject) => {
            if (count == -1 && quantity == 1) {
                Cart.updateOne({ _id: mongoose.Types.ObjectId(data.cart) },
                    {
                        $pull: { products: { item: mongoose.Types.ObjectId(data.product) } }
                    }).then((response) => {
                        response.removeProduct = true
                        resolve(response)
                    })
            } else {
                let items = await Cart.findOneAndUpdate({ _id: mongoose.Types.ObjectId(data.cart), 'products.item': mongoose.Types.ObjectId(data.product) }, {
                    $inc: { 'products.$.quantity': data.count, 'products.$.price': data.price }
                }).exec()
                resolve({ status: true })
            }
        })
    }, getAllAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await Cart.aggregate([{
                $match: { user: userId }
            }, {
                $unwind: '$products'
            }, {

                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity',
                    price: '$products.price',
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $project: {
                    item: 1, quantity: 1, price: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }, {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                }
            }

            ]).then((total) => {
                console.log('total kitty');
                resolve(total)
            })
        })
    }, deleteCartItem: (data) => {
        return new Promise(async (resolve, reject) => {
            Cart.updateOne({ _id: mongoose.Types.ObjectId(data.cart) },
                {
                    $pull: { products: { item: mongoose.Types.ObjectId(data.product) } }
                }).then((response) => {
                    response.removeProduct = true
                    resolve(response)
                })
        })
    },getUserAddress:(userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
            Users.aggregate([{$match:{_id:userId,isBlocked:false}},{
                $project:{
                    deliveryDetails:1
                }
            },{$unwind:'$deliveryDetails'}]).then((response)=>{
                resolve(response)
            })
        })
    },saveAddress:(orederDetails,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let addObj = {
                    first_name: orederDetails.first_name,
                    last_name: orederDetails.last_name,
                    phone_number: orederDetails.phone_number,
                    email: orederDetails.email,
                    address1: orederDetails.address1,
                    address2: orederDetails.address2,
                    city: orederDetails.city,
                    district: orederDetails.district,
                    pincode: orederDetails.zip,
                    message: orederDetails.message,
            }
            Users.updateOne({_id:userId},{
                $push:{
                    deliveryDetails:[addObj]
                }
            }).then((response)=>{
                console.log("push ayi");
                console.log(response);
                resolve({status:true})
            })
        })
    },deleteAddress:(userId,addressId)=>{
        return new Promise(async (resolve,reject)=>{
            Users.updateOne({_id:userId},{
                $pull: { deliveryDetails: { _id: mongoose.Types.ObjectId(addressId) } }}).then((response)=>{
                    resolve({status:true})
                })
        })
    }, placeOrder:(orederDetails, userId, product, amount) => {
        return new Promise(async (resolve, reject) => {
            const {address} = orederDetails
            let status = orederDetails['payment-method'] === 'COD' ? 'placed' : 'pending'
            let placed = orederDetails['payment-method'] ==='COD' ? true : false
            let proObj = {
                address:mongoose.Types.ObjectId(address),
                placed:placed,
                user: userId,
                paymentMethod: orederDetails['payment-method'],
                products: product,
                totalAmount: amount[0].total,
                status: status,
            }
            Order.create([proObj]).then((response) => {
                for (let i = 0; i < product.length; i++) {
                    products.updateOne({_id:product[i].item},{$inc:{stock:-product[i].quantity}}).then((response)=>{
                    })
                }
                Cart.deleteOne({ user: userId }).then((data) => {
                })
                
                console.log("ithe order addichu");
                resolve(response[0]._id);


            })

        })
    }, getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await Cart.findOne({ user: userId })
            resolve(cart.products)
        })
    }, generateRazorpay: (orderId, amount) => {
        console.log('amount aanu');
        console.log(amount[0].total);
        total = parseInt(amount[0].total)
        return new Promise(async (resolve, reject) => {
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("new order", order);
                    resolve(order)
                }

            });
        })
    }, verifyPayment: (details)=>{
        return new Promise(async(resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac==details['payment[razorpay_signature]']) {
                resolve()
            }else{
                reject()
            }
        })
    }, changePaymentStatus: (orderId)=>{
        return new Promise(async(resolve,reject)=>{
            Order.updateOne({_id:mongoose.Types.ObjectId(orderId)},{
                $set:{
                    status:'placed',
                    placed: true
                }
            }).then(()=>{
                resolve()
            })
        })
    },addTowhislist: (proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let pro = proId.product
            let prObj = {
                product:pro,
                isDeleted:false
            }
            
            let data = await Users.findOne({_id:userId})
            console.log(data);
            if (data) {
                let itemIndex = data.whislist.findIndex(w => w.product == pro);
                console.log("itemindex",itemIndex);
                console.log(pro);
                if (itemIndex !=-1) {
                    Users.updateOne({_id:userId},{
                        $pull: { whislist: { product: mongoose.Types.ObjectId(pro) } }
                    }).then((response)=>{
                        console.log("pull aayo");
                        console.log(response);
                        resolve({status:false})
                    })
                }else{
                    Users.findOneAndUpdate({_id:userId},{
                        $push:{
                            whislist:[prObj]
                        }
                    }).then((response)=>{
                        console.log("whislist push aayi");
                        console.log(response);
                        response = true
                        resolve({status:true})
                    })
                }
                
            }
        })
    },getAllWhislist: (userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
            Users.aggregate([{
                $match:{
                    _id:userId
                }},{
                    $lookup:{
                        from:'products',
                        localField:'whislist.product',
                        foreignField:'_id',
                        as:'whislist'
                    }
                },{
                    $unwind:"$whislist"
                }]).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },getUserOrder: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            Order.aggregate([{$match:{user:userId}},{$unwind:'$products'},{$lookup:{
                from: 'products',
                localField: 'products.item',
                foreignField: '_id',
                as: 'product'
            }},{$unwind:'$product'},{
                $lookup:{
                    from:'sellers',
                    localField:'product.seller',
                    foreignField:'_id',
                    as:'seller'
                }
            },{$unwind:'$seller'},{$sort:{
                createdAt:-1
            }},{
                $project:{
                    address:1,
                    product:1,
                    products:1,
                    seller:1,
                    status:1,
                    user:1,
                    dateString:{$dateToString:{format: "%d:%m:%Y", date:"$updatedAt"}}
                }
            }]).then((data)=>{
                console.log('datass');
                console.log(data);
                resolve(data)
            })
        })
    },shippProduct:(order,product)=>{
        console.log(order);
        return new Promise(async(resolve,reject)=>{
            Order.updateOne({
                _id:mongoose.Types.ObjectId(order),'products.item':mongoose.Types.ObjectId(product)
            },{
                $set:{
                    'products.$.placed':false,'products.$.ship':true,'products.$.productStatus':"shippped",
                }
            }).then((response)=>{
                console.log('response');
                console.log(response);
                resolve({status:true})
            })
        })
    },cancelProduct:(order,product)=>{
        return new Promise(async(resolve,reject)=>{
            Order.updateOne({
                _id:mongoose.Types.ObjectId(order),'products.item':mongoose.Types.ObjectId(product)
            },{
                $set:{
                    'products.$.placed':false,'products.$.ship':false,'products.$.cancel':true,'products.$.productStatus':"Cancelled",
                }
            }).then((response)=>{
                resolve({status:true})
            })
        })
    },deliveredOrder:(order,product)=>{
        return new Promise(async(resolve,reject)=>{
            Order.updateOne({
                _id:mongoose.Types.ObjectId(order),'products.item':mongoose.Types.ObjectId(product)
            },{
                $set:{
                    'products.$.placed':false,'products.$.ship':false,'products.$.cancel':false,'products.$.completed':true,'products.$.productStatus':"Delivered"
                }
            }).then((response)=>{
                resolve({status:true})
            })
        })
    },getUserDetais:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            Users.aggregate([{
                $match:{
                    _id:mongoose.Types.ObjectId(userId),isBlocked:false
                }
            }]).then((response)=>{
                console.log('userDAta');
                console.log(response);
                resolve(response)
            })
        })
    },getUserAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            Users.aggregate([{
                $match:{
                    _id:mongoose.Types.ObjectId(userId),isBlocked:false
                }
            },{$unwind:'$deliveryDetails'},{
                $project:{
                    _id:1,
                    deliveryDetails:1
                }
            }]).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },updataProfile:(userData,id)=>{
        return new Promise(async(resolve,reject)=>{
            Users.updateOne({_id:id},{
                $set:{
                    full_name:userData.fname,
                    email:userData.email,
                    phone_number:userData.phone_number,
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },updataImageProfile:(userData,img,id)=>{
        return new Promise(async(resolve,reject)=>{
            Users.updateOne({_id:id},{
                $set:{
                    full_name:userData.fname,
                    email:userData.email,
                    phone_number:userData.phone_number,
                    images:img.filename
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
}

