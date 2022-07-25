const mongoose = require('mongoose'),
Schema = mongoose.Schema;
const collections = require('../config/collections')

const CartSchema = new mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:"users",
    },
    products:[{
        item:{
            type:Schema.Types.ObjectId,
            ref:"products"
        },
        quantity:Number,
        price:Number,
        placed:Boolean,
        ship:Boolean,
        cancel:Boolean,
        completed:Boolean,
        productStatus:String
    }],
    isDeleted:Boolean,
    
},{ timestamps: true })

module.exports = mongoose.model(collections.CART_COLLECTIONS, CartSchema)