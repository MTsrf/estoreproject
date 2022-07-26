const db = require('../config/connections')
const Seller = require('../model/Seller')
const bcrypt = require('bcrypt')
const category = require('../model/Category')
const products = require('../model/Product')
const Order =  require('../model/Order')
const Users = require('../model/User')
const  mongoose = require('mongoose')
module.exports = {
    doUnique:(sellerData)=>{
        return new Promise(async(resolve,reject)=>{
           let seller = await Seller.findOne({phone_number:sellerData.phone_number})
           console.log(seller);
           console.log(sellerData);
           console.log('seller');
           resolve(seller) 
        })
    },
    sellerRegister:(regData)=>{
        console.log('regDAta');
        return new Promise(async(resolve,reject)=>{
            regData.password = await bcrypt.hash(regData.password,10)
            const doc = await Seller.create({
                full_name:regData.full_name,
                phone_number:regData.phone_number,
                email:regData.email,
                password:regData.password,
                isVerified:false,
                isBlocked:false,
                
            }).then((response)=>{
                console.log(response);
                console.log("failed response");
                resolve(response)
            })
            console.log(doc);
        })
    },
    doLoginSeller:(loginData)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            let seller = await Seller.findOne({phone_number:loginData.phone_number,isVerified:true,isBlocked:false})
            if (seller) {
                bcrypt.compare(loginData.password,seller.password).then((status)=>{
                    if (status) {
                        console.log(status)
                        response.seller = seller
                        response.status = true
                        resolve(response)
                    }else{
                        response.status = false;
                        response.passwErr = true
                        resolve(response)
                    }
                })
            }else{
                response.status= false;
                response.sellerError = true;
                resolve(response)
            }
        })
    },

    addProduct:(data,sellerData,productImg)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(productImg);
            console.log(sellerData);
            const catdata = await category.findOne({category:data.category})
            const seller = await Seller.findOne({phone_number:sellerData.phone_number})
            if (!productImg) {
                console.log('img not available');
            }else{
                const productsDtails = await new products({
                    product_name:data.product_name,
                    desciptions:data.description,
                    brand_name:data.brand_name,
                    stock:data.stock,
                    price:data.price,
                    isDeleted:false,
                    category:catdata._id,
                    seller:seller._id,
                    Images:{productImg}
                });
                await productsDtails.save(async(err,result)=>{
                    if (err) {
                        console.log('not added '+err);
                    }else{
                        resolve({date:result,msg: "product added succesfully"})
                    }
                })
            }

        })
    },getAllProducts:(sellerId)=>{
        console.log(sellerId);
        return new Promise(async(resolve,reject)=>{
            let getallproducts = await products.aggregate([{$match:{seller:sellerId,isDeleted:false}},
                {
                    $lookup:{
                        from:'categories',
                        localField:'category',
                        foreignField:'_id',
                        pipeline:[{$project:{
                            _id:0,
                        }}],
                        as:'category',
                    }
                },{$unwind:"$category"},{$match:{'category.isDeleted':false}},{
                    $unwind:"$Images"
                },{
                    $lookup:{
                    from:'sellers',
                    localField:'seller',
                    foreignField:'_id',
                    as:'seller',
                }},{$unwind:"$seller"},{$match:{'seller.isVerified':true,'seller.isBlocked':false}},
                {
                    $project:
                    {
                    Images:'$Images.productImg',
                    product_name:1,
                    desciptions:1,
                    brand_name:1,
                    price:1,
                    stock:1,
                    category:1,
    
                }
                }
           ])
            console.log(getallproducts);
            resolve(getallproducts)
        })
    },deleteProducts:(delId)=>{
        return new Promise(async(resolve,reject)=>{
            let deletedProduct = await products.updateOne({'_id':delId},{$set:{ 'isDeleted':true }})
            console.log(deletedProduct);
            resolve(deletedProduct)
        })
    },getOrders:(sellerId)=>{
        console.log(sellerId);
        return new Promise(async(resolve,reject)=>{
            Order.aggregate([{
                $unwind:'$products'
            },{$match:{status:"placed"}},{
                $lookup:{
                    from:'products',
                    localField:'products.item',
                    foreignField:'_id',
                    as:'product'
                }
            },{ $unwind:'$product'},{
                $lookup:{
                    from:'sellers',
                    localField:'product.seller',
                    foreignField:'_id',
                    as:'seller'
                }
            },{ $unwind:'$seller' },{
                $match:{
                    'seller._id':sellerId
                }
            },{
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'user'
                }
            },{
                $unwind:'$user'
            },{$sort:{
                createdAt:-1
            }}
        ]).then((response)=>{
            console.log('new orders');
                console.log(response);
                resolve(response)
            })
        })
    },singleViewOrders:(id,product,address,sellerId)=>{
        return new Promise(async(resolve,reject)=>{
            Users.aggregate([{$unwind:'$deliveryDetails'},{
                $match:{'deliveryDetails._id':mongoose.Types.ObjectId(address)}
            },{$lookup:{
                from: 'orders',
                localField: 'deliveryDetails._id',
                foreignField: 'address',
                as: 'order'
              }},{$unwind:'$order'},{$match:{'order._id':mongoose.Types.ObjectId(id)}},{
                $unwind:'$order.products'
              },{$lookup:{
                from: 'products',
                localField: 'order.products.item',
                foreignField: '_id',
                as: 'product'
              }},{$unwind:'$product'},{$match:{'product._id':mongoose.Types.ObjectId(product),'product.isDeleted':false}},{$lookup:{
                from: 'sellers',
                localField: 'product.seller',
                foreignField: '_id',
                as: 'seller'
              }},{$unwind:'$seller'},{$match:{'seller._id':mongoose.Types.ObjectId(sellerId),'seller.isBlocked':false}}]).then((response)=>{
                console.log("===================================================");
                console.log(response);
                resolve(response)
              })
        })
    },totalRevenue:async(seller)=>{
        try {
            let total = await Order.aggregate([{$unwind:'$products'},{$match:{'products.completed':true}},{
                $lookup:{
                    from:'products',
                    localField:'products.item',
                    foreignField:'_id',
                    as:'product'
                }
            },{$unwind:'$product'},{$match:{'product.seller':seller}},{
                $group:{
                    _id:"",
                    total:{
                        $sum:'$totalAmount'
                    }
                }
            }])
            console.log('====================');
            console.log(total);
            return total
        }catch (error) {
            
        }
    },totalSales:async(seller)=>{
        try {
            let total = await Order.aggregate([{$unwind:'$products'},{$match:{'products.completed':true}},{
                $lookup:{
                    from:'products',
                    localField:'products.item',
                    foreignField:'_id',
                    as:'product'
                }
            },{$unwind:'$product'},{$match:{'product.seller':seller}}])
            return total.length
        } catch (error) {
            
        }
    },activeOrders:async(seller)=>{
        try {
            let total = await Order.aggregate([{$unwind:'$products'},{$match:{status:"placed"}},{$match:{
                $or:[{'products.ship':true},{'products.placed':true}]
            }},{$lookup:{
                from:'products',
                localField:'products.item',
                foreignField:'_id',
                as:'product'
            }},{$unwind:'$product'},{$match:{'product.seller':seller}}])
            return total.length
        } catch (error) {
            
        }
    },totalProdcut:async(seller)=>{
        try {
            let total = await products.aggregate([{$match:{seller:seller}}])
            return total.length
        } catch (error) {
            
        }
    },totalOrders:async(seller)=>{
        try {
            let total = await Order.aggregate([{$unwind:'$products'},{$lookup:{
                from:'products',
                localField:'products.item',
                foreignField:'_id',
                as:'product'
            }},{$unwind:'$product'},{
                $match:{'product.seller':seller}
            }])
            console.log('length of tthe order');
            console.log(total.length);
            return total.length
        } catch (error) {
            
        }
    },cancelOrder:async(seller)=>{
        try {
            let total = await Order.aggregate([{$unwind:'$products'},{
                $lookup:{
                    from:'products',
                    localField:'products.item',
                    foreignField:'_id',
                    as:'product'
                }
            },{$unwind:'$product'},{$match:{'product.seller':seller}},{$match:{'products.cancel':true}}])
            console.log(total);
            return total.length
        } catch (error) {
            
        }
    },pendingOrder:async(seller)=>{
        try {
            let total = await Order.aggregate([{$unwind:'$products'},{$lookup:{
                from:'products',
                localField:'products.item',
                foreignField:'_id',
                as:'product'
            }},{$unwind:'$product'},{$match:{'product.seller':seller}},{$match:{status:'pending'}}])
            return total.length
        } catch (error) {
            
        }
    },getSeller:async(seller)=>{
        try {
            let data = await Seller.aggregate([{$match:{_id:seller}}])
            console.log(data);
            return data
            
        } catch (error) {
            
        }
    }
    // singleViewOrders:(id,product,address,sellerId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         Order.aggregate([{
    //             $match:{
    //                 _id:mongoose.Types.ObjectId(id)
    //             }
    //         },{$unwind:'$products'},{
    //             $lookup:{
    //                 from:'products',
    //                 localField:'products.item',
    //                 foreignField:'_id',
    //                 as:'product'
    //             }
    //         },{
    //             $unwind:'$product'
    //         },{$match:{'product._id':mongoose.Types.ObjectId(product)}},{
    //             $lookup:{
    //                 from: 'sellers',
    //                 localField: 'product.seller',
    //                 foreignField: '_id',
    //                 as: 'seller'
    //               }
    //         },{
    //             $unwind:'$seller'
    //         },{
    //             $match:{
    //                 'seller._id':sellerId
    //             }
    //         },{
    //             $lookup:{
    //                 from: 'users',
    //                 localField: 'user',
    //                 foreignField: '_id',
    //                 as: 'user'
    //               }
    //         },{
    //             $unwind:'$user'
    //         },{
    //             $match:{'user.deliveryDetails._id':mongoose.Types.ObjectId(address)}
    //         }]).then((response)=>{
    //             console.log('single view');
    //             console.log(response);
    //             resolve(response)
    //         })
    //     })
    // }
    
    
}