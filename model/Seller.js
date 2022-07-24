var mongoose = require('mongoose')
var collections = require('../config/collections')


const sellerSchema = new mongoose.Schema({
    full_name: String,
    phone_number:Number,
    email:String,
    password:String,
    isVerified:Boolean,
    isBlocked:Boolean,
})


module.exports = mongoose.model(collections.SELLER_COLLECTIONS, sellerSchema)