const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    selected : {
        type: String,
        trim: true
    },
    AddressList: [
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            mobileNumber: {
                type: String,
                required: true,
                trim: true
            },
            pinCode: {
                type: String,
                required: true,
                trim: true
            },
            locality: {
                type: String,
                required: true,
                trim: true
            },
            address: {
                type: String,
                required: true,
                trim: true
            },
            cityDistrictTown: {
                type: String,
                required: true,
                trim: true
            },state: {
                type: String,
                required: true,
                trim: true
            }
        }
    ]
},{timestamps: true});

exports.Address = mongoose.model('Address',addressSchema);