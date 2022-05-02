const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    orderedItems: [
        {
            product: {type: mongoose.Schema.Types.ObjectId,ref:'Product',required: true},
            quantity: {type: Number,default: 1}           
        }
    ],
    address: {
        type: String,
        required: true,
        trime: true
    }
},{timestamps: true});

exports.Order = mongoose.model("Order",orderSchema);