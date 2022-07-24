const db = require('../config/connections')
const Admin = require('../model/Admin')
const Seller = require('../model/Seller')
const bcrypt = require('bcrypt')
const toLowerCase = require('tolowercase')
const Category = require('../model/Category')
const Products = require('../model/Product')
const Banner = require('../model/Banner')
const { response } = require('express')
const Order = require('../model/Order')
const Users = require('../model/User')

module.exports = {
    doAdminLogin: (adminData) => {
        let data = adminData.email.toLowerCase();
        console.log(data);
        return new Promise(async (resolve, reject) => {
            let response = {}
            let adminAuth = await Admin.findOne({ email: data })
            if (adminAuth) {
                bcrypt.compare(adminData.password, adminAuth.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.status = true;
                        resolve(response)
                    } else {
                        console.log("login Failed brypt");
                        response.status = false;
                        response.adminErr = true
                        resolve(response)
                    }
                })
            } else {
                response.status = false
                response.passwErr = true;
                console.log("admin login error");
                resolve(response)
            }
        })
    }, doUniqueCategory: (catUnique) => {
        return new Promise(async (resolve, reject) => {
            let uniqueCate = await Category.findOne({ category: catUnique.category, isDeleted: false })
            console.log(uniqueCate);
            resolve(uniqueCate)
        })

    }, addCategory: (categoryData) => {
        let cat = categoryData.category
        console.log("categorData" + cat);
        return new Promise(async (resolve, reject) => {
            let dats = await Category.findOne({ category: cat, isDeleted: true })
            console.log(dats);
            if (!dats) {
                let add = await Category.create({ category: cat, isDeleted: false }).then((data) => {
                    resolve(data)
                })
            } else {
                let deletedSoft = await Category.updateOne({ category: cat }, { $set: { isDeleted: false } })
                resolve(deletedSoft)
            }
        })
    },

    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let displayCategory = await Category.aggregate([{
                $match: {
                    isDeleted: false
                }
            }])
            resolve(displayCategory)
            console.log(displayCategory)
        })
    },
    getDisableSeller: () => {
        return new Promise(async (resolve, reject) => {
            let disFalseSeller = await Seller.aggregate([{
                $match: {
                    isVerified: false
                }
            }])
            resolve(disFalseSeller)
            console.log(disFalseSeller);
        })
    }, getallSeller: () => {
        return new Promise(async (resolve, reject) => {
            let allseller = await Seller.aggregate([{
                $match: {
                    isVerified: true
                }
            }])
            console.log(allseller);
            resolve(allseller)
        })
    }
    ,
    doAccept: (acceptId) => {
        return new Promise(async (resolve, reject) => {
            let acceptRequest = await Seller.updateOne({ _id: acceptId }, { $set: { isVerified: true } })
            console.log(acceptRequest);
            resolve(acceptRequest)
        })
    },
    softDelet: (prodId) => {
        return new Promise(async (resolve, reject) => {
            let deletedSoft = await Category.updateOne({ _id: prodId }, { $set: { isDeleted: true } })
            resolve(deletedSoft)
        })
    }, uniqueUpdateCategory: (value) => {
        let editvalue = value.edit
        return new Promise(async (resolve, reject) => {
            let uniqueUpdate = await Category.findOne({ category: editvalue, isDeleted: false })
            resolve(uniqueUpdate)
        })
    }
    , updateCategory: (updateId, editValue) => {
        console.log(editValue);
        let value = editValue.edit
        return new Promise(async (resolve, reject) => {
            let updatedData = await Category.updateOne({ _id: updateId }, { $set: { category: value, isDeleted: false } })
            console.log(updatedData);
            resolve(updatedData)
        })
    }, blockUser: (blockId) => {
        console.log(blockId);
        return new Promise(async (resolve, reject) => {
            let bUser = await Seller.updateOne({ _id: blockId }, { $set: { isBlocked: true } })
            resolve(bUser)
        })
    }, unBlockUser: (unBlockId) => {
        return new Promise(async (resolve, reject) => {
            let unBlock = await Seller.updateOne({ _id: unBlockId }, { $set: { isBlocked: false } })
            resolve(unBlock)
        })
    }, viewCategoryProducts: (viewId) => {
        return new Promise(async (resolve, reject) => {
            let CatviewProducts = await Products.aggregate([{ $match: { category: viewId, isDeleted: false } }, {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 0
                        }
                    }],
                    as: 'category'
                }
            }, {
                $unwind: '$category'
            }, { $match: { 'category.isDeleted': false } }, {
                $unwind: '$Images'
            }, {
                $lookup: {
                    from: 'sellers',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'seller'
                }
            }, { $unwind: '$seller' }, { $match: { 'seller.isVerified': true, 'seller.isBlocked': false } }, {
                $project: {
                    Images: '$Images.productImg',
                    product_name: 1,
                    seller: 1,
                    brand_name: 1,
                    stock: 1,
                    price: 1
                }
            }])
            console.log(CatviewProducts);
            resolve(CatviewProducts)
        })
    }, getAllProductsAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let getAllProducts = await Products.aggregate([{ $match: { isDeleted: false } }, {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 0
                        }
                    }],
                    as: 'category'
                }
            }, {
                $unwind: '$category'
            }, { $match: { 'category.isDeleted': false } }, {
                $unwind: '$Images'
            }, {
                $lookup: {
                    from: 'sellers',
                    localField: 'seller',
                    foreignField: '_id',
                    as: 'seller'
                }
            }, {
                $unwind: '$seller'
            }, { $match: { 'seller.isVerified': true, 'seller.isBlocked': false } }, {
                $project: {
                    Images: '$Images.productImg',
                    product_name: 1,
                    category: 1,
                    seller: 1,
                    brand_name: 1,
                }
            }
            ])
            console.log(getAllProducts)
            resolve(getAllProducts)
        })
    },addBanner:(data,img)=>{
        return new Promise(async(resolve,reject)=>{
            let dataImg = {
                image:img.filename,
                banner_heading:data.product_name,
                descriptions:data.description,
                isDeleted:false,
            }
            Banner.create({
                Banner:dataImg
            }).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },deleteBanner:(delId)=>{
        console.log(delId);
        return new Promise(async(resolve,reject)=>{
            Banner.updateOne({'Banner._id':delId},{$set:{'Banner.$.isDeleted':true}}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },getfrontBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            Banner.aggregate([{
                $match:{
                    'Banner.isDeleted':false
                }
            },{$unwind:'$Banner'}]).then((data)=>{
                console.log(data);
                resolve(data)
            })
        })
    },getRandomProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            Products.aggregate([{
                $match:{
                    isDeleted:false
                }
            },{
                $lookup:{
                    from:'sellers',
                    foreignField:'_id',
                    localField:'seller',
                    as:'seller'
                }
            },{
                $unwind:'$seller'
            },{$match:{
                'seller.isBlocked':false
              }},{
                $sample:{size:8}
              }]).then((response)=>{
                console.log(response);
                resolve(response)
              })
        })
    },featuredCategory:(data,img)=>{
        return new Promise(async(resolve,reject)=>{
            let featured = {
                image:img.filename,
                title:data.quality,
                descriptions:data.heading,
                isDeleted:false
            }
            Banner.create({
                featured:featured
            }).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },getFeaturedCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            Banner.aggregate([{
                $match:{'featured.isDeleted':false}},{$project:{
                    featured:1
                }},{$unwind:'$featured'}
            ]).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },deleteFeature:(delId)=>{
        return new Promise(async(resolve,reject)=>{
            Banner.updateOne({'featured._id':delId},{'featured.$.isDeleted':true}).then((data)=>{
                resolve(data)
            })
        })
    },sellersOrder: async()=>{
        try{
            let allOrder = await Order.aggregate([{$unwind:'$products'},{$lookup:{
                from: 'products',
                localField: 'products.item',
                foreignField: '_id',
                as: 'product'
              }},{$unwind:'$product'},{$lookup:{
                from: 'sellers',
                localField: 'product.seller',
                foreignField: '_id',
                as: 'seller'
              }},{
                $unwind:'$seller'
              },{
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'users'
                }
              },{$unwind:'$users'}])
              return allOrder
        }catch(err){
            
        }
        
    },completeOrder: async()=>{
        try {
            let completeOrder = await Order.aggregate([{$unwind:'$products'},{$match:{'products.completed':true}},{$lookup:{
                from:'products',
                localField:'products.item',
                foreignField:'_id',
                as:'product',
            }},{$unwind:'$product'},{$lookup:{
                from:'sellers',
                localField:'product.seller',
                foreignField:'_id',
                as:'seller'
            }},{$unwind:'$seller'},{$lookup:{
                from:'users',
                localField:'user',
                foreignField:'_id',
                as:'users'
            }},{$unwind:'$users'}])
            return completeOrder
        } catch (error) {
            
        }
    },pendingOrders:async()=>{
        try{
            let pendingOrders = await Order.aggregate([{$unwind:'$products'},{$match:{$or:[{'products.cancel':true},{status:'pending'}]}},{$lookup:{
                from:'products',
                localField:'products.item',
                foreignField:'_id',
                as:'product',
            }},{$unwind:'$product'},{$lookup:{
                from:'sellers',
                localField:'product.seller',
                foreignField:'_id',
                as:'seller'
            }},{$unwind:'$seller'},{$lookup:{
                from:'users',
                localField:'user',
                foreignField:'_id',
                as:'users'
            }},{$unwind:'$users'}])
            console.log(pendingOrders);
            return pendingOrders
        }catch(error){

        }
        
    },totalRevanue:async()=>{
        try {
            let totalRevanue = await Order.aggregate([{$unwind:'$products'},{$match:{
                'products.completed':true
            }},{$group:{
                _id:"",
                total:{
                    $sum:'$totalAmount'
                }
            }}])
            console.log(totalRevanue);
            return totalRevanue
        } catch (error) {
            
        }
    },totalSales:async()=>{
        try {
            let totalSales = await Order.aggregate([{$unwind:'$products'},{$match:{
                'products.completed':true
            }}])
            let totalSale = totalSales.length
            return totalSale
        } catch (error) {
            
        }
    },activeOrder:async()=>{
        try {
            let activeOrders = await Order.aggregate([{$unwind:'$products'},{$match: { $or: [{ 'products.ship': true }, { 'products.placed': true }] }}])
            console.log(activeOrders);
            let actiorders = activeOrders.length
            return actiorders
        } catch (error) {
            
        }
    },totalProducts:async()=>{
        try {
            let totalProducts = await Products.find({})
            let total = totalProducts.length
            return total
        } catch (error) {
            
        }
    },totalCustomer:async()=>{
        try {
            let totalCustomer = await Users.find({})
            let total = totalCustomer.length
            return total
        } catch (error) {
            
        }
    },totalSellers:async()=>{
        try {
            let totalseller = await Seller.find({})
            let total = totalseller.length
            return total
        } catch (error) {
            
        }
    }
}