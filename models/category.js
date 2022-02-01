const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        require: true,
        trim: true
    },
    slug:{
        type: String,
        required: true,
        unique: true
    },
    parentId:{
        type: String
    }
},{timestamps: true});



module.exports.Category = mongoose.model("Category",categorySchema);