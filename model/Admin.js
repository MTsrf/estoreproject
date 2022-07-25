const mongoose = require('mongoose')
const collections= require('../config/collections')



const adminSchema = new mongoose.Schema({
    email: String,
    password: String,
})
module.exports = mongoose.model(collections.ADMIN_COLLECTIONS, adminSchema)


