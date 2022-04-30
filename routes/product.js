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
const {Category} = require('../models/category');

const {upload,getImage} = require('../s3');

// const storage = multer.diskStorage({
//     destination: function (req,file,cb){
//         cb(null,path.join(path.dirname(__dirname),'uploads'))
//     },
//     filename: function(req,file,cb){
//         cb(null,shortid.generate()+"-"+file.originalname)
//     }
// });

// const upload = multer({storage});

// router.get('/images/:key',async (req,res)=>{
//     const key = req.params.key;
//     const readStream = await getImage(key);
//     readStream.pipe(res);
// });

router.post('/create',[auth,admin],upload.array('productPicture'), async (req,res)=>{
    const {name,price,description,category,quantity} = req.body;

    let productPictures = [];

    if(req.files.length>0){
        productPictures = req.files.map(file => {
            return {img: file.key}
        });
    }
    // return res.send(req.files);


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
    });
});

const productStream = Product.watch();
productStream.on('change',async (change)=>{
    console.log(change);
    io.emit("products_change",'changed');        
});

router.get('/get',[auth,admin],async (req,res)=>{
    try{
        const products = await Product.find({})
        .select({_id:1,name:1,price:1,quantity:1,description:1,category:1,productPictures:1})
        .populate("category","_id name");
        
        if(products){
            return res.status(200).send(products);
        }else{
            res.status(400).send("Products not found"); //Bad Request
        }
    }catch(err){
        return res.status(500).send("Server error"); //Internal server error
    }
});

router.get('/get/:slug',async (req,res)=>{
    try{
        const {slug} = req.params;
        const category = await Category.findOne({slug: slug}).select({_id:1});
        if(category){
            try{

                const products = await Product.find({category: category._id}).limit(30).sort({createdAt:-1});
                if(products){
                    res.status(200).send(products);
                }
            }catch(err){
                res.status(500).send("Server error"); //Internal server error
            }


        }
    }catch(err){
        res.status(500).send("Server error"); //Internal server error
    }

});

router.get("/info/:productId",async (req,res)=>{
    // .select({_id:1,userName:1,email:1,role:1})
    try{
        const { productId } = req.params;
        if(productId){
            let user = await Product.findOne({_id: productId});
            if(user){
                res.status(200).json(user);
            }else{
                res.status(404).send("Product not found"); // server did not find a current representation for the target resource 
            }
        }else{
            res.status(400).send("Params Required"); //Bad Request
        }
    }catch(err){        
        return res.status(500).send(err); //Internal server eroor
    }
});


exports.productRouter = router;

