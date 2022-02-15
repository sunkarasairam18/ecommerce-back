const express = require('express');
const router = express.Router();
const multer = require('multer');
const { io } = require("../sockets");

const shortid = require('shortid');
const path = require('path');
const slugify = require('slugify');

const {auth} = require('../middleware/auth');
const {admin} = require('../middleware/admin');
const {Product} = require('../models/product');

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,path.join(path.dirname(__dirname),'uploads'))
    },
    filename: function(req,file,cb){
        cb(null,shortid.generate()+"-"+file.originalname)
    }
});

const upload = multer({storage});

router.post('/create',[auth,admin],upload.array('productPicture'), async (req,res)=>{
    const {name,price,description,category,quantity} = req.body;

    let productPictures = [];

    if(req.files.length>0){
        productPictures = req.files.map(file => {
            return {img: file.filename}
        });
    }

    const product = new Product({
        name: name,
        slug: slugify(name),
        price,
        quantity,
        description,
        productPictures,
        category,
        createdBy: req.user._id
    });

    product.save((err,result)=>{
        if(err) return res.status(400).json({err});
        if(result){
            res.status(201).json({product});
        }
    })
});

const productStream = Product.watch();
productStream.on('change',async (change)=>{
    console.log(change);
    io.emit("products_change",'changed');        
});

router.get('/get',[auth,admin],async (req,res)=>{
    try{
        const products = await Product.find({})
        .select({_id:1,name:1,price:1,quantity:1,description:1,category:1});
        
        if(products){
            return res.status(200).send(products);
        }
    }catch(err){
        return res.status(500).send("Server error"); //Internal server error
    }
});


exports.productRouter = router;

