var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var collections = require('../config/collections')

const OrderSchema = new mongoose.Schema({
    address:{
        type:Schema.Types.ObjectId,
        ref:"users.deliveryDetails"
    },
    user:{
        type: Schema.Types.ObjectId,
        ref:"users"
    },
    paymentMethod:String,
    products:[{
        item:{
            type:Schema.Types.ObjectId,
            ref:'products',
        },
        quantity:Number,
        price:Number,
        placed:Boolean,
        ship:Boolean,
        cancel:Boolean,
        completed:Boolean,
        productStatus:String,
    }],
    totalAmount:Number,
    status:String

},{ timestamps: true })

module.exports = mongoose.model(collections.ORDER_COLLECTIONS,OrderSchema)