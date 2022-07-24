const mongoose = require('mongoose'),
Schema = mongoose.Schema;

const collections = require('../config/collections')


const ProductSchema = new mongoose.Schema({
    product_name:String,
    desciptions:String,
    category:{
        type : Schema.Types.ObjectId,
        ref: "categories"
    },
    brand_name:String,
    price:Number,
    seller:{
        type:Schema.Types.ObjectId,
        ref:"sellers"
    },
    isDeleted:Boolean,
    stock:Number,
    Images:
    {
        type:Array
    },
    created_at: {
        type:Date,
        required:true,
        default:Date.now
    },
    weeklysale:Date,



})

module.exports = mongoose.model(collections.PRODUCT_COLLECTIONS,ProductSchema)