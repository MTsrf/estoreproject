const mongoose = require('mongoose')
const collections = require('../config/collections')

const BannerSchema = new mongoose.Schema({
    Banner:[{
        image:String,
        banner_heading:String,
        descriptions:String,
        isDeleted:Boolean
    }],
    featured:[{
        image:String,
        title:String,
        descriptions:String,
        isDeleted:Boolean
    }]
})
module.exports = mongoose.model(collections.BANNER_COLLECTIONS, BannerSchema)