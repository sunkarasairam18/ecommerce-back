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
    type: {
        type: String

    },
    categoryImage : { type: String},
    parentId:{
        type: String
    }
},{timestamps: true});



exports.Category = mongoose.model("Category",categorySchema);