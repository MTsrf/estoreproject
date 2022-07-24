const mongoose = require('mongoose'),
Schema = mongoose.Schema
const collections = require('../config/collections')

const userSchema = new mongoose.Schema({
    full_name:String,
    email:String,
    phone_number:Number,
    password:String,
    isBlocked:Boolean,
    whislist:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:'products'
        },
        isDeleted:Boolean
    }],
    deliveryDetails:[{
        first_name:String,
        last_name:String,
        phone_number:Number,
        email:String,
        address1:String,
        address2:String,
        city:String,
        district:String,
        pincode:Number,
        message:String
    }],
    images:String,
    info:[{
        bio:String,
        dob:String,
        country:String
    }]
})

module.exports = mongoose.model(collections.USER_COLLECTIONS,userSchema)