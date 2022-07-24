var mongoose = require('mongoose')
var collections = require('../config/collections')


const CategorySchema = new mongoose.Schema({
    category:String,
    isDeleted:Boolean
})



module.exports = mongoose.model(collections.CATEGORY_COLLECTIONS,CategorySchema)