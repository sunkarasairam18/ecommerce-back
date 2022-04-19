const express = require('express');
const router = express.Router();
const { user } = require('../middleware/user');
const { auth } = require("../middleware/auth");
const { Cart } = require('../models/cart');
const {Product} = require('../models/product');

router.get('/get',[auth,user],async (req,res)=>{
    const usercart = await Cart.findOne({user: req.user._id}).select({cartItems:1});
    if(usercart){
        var cart = [];
        let l = usercart.cartItems.length;
        for(let i = 0;i<l;i++){
            let item = usercart.cartItems[i];
            let product = await Product.findOne({_id : item.product}).select({_id:1,name:1,productPictures:1,price:1,slug:1});
            if(product){
                cart.push({
                    _id: product._id,
                    name: product.name,
                    img: product.productPictures[0].img,
                    price: product.price,
                    slug: product.slug,
                    quantity: item.quantity
                })
            }            
        }

        return res.status(200).json(cart);
    }
    return res.status(404).send("Cart Not Found");
}); 

// router.get('/cartcount',[auth,user],async (req,res)=>{
//     const usercart = await Cart.findOne({user: req.user._id}).select({cartItems:1});
//     if(usercart){
//         return res.status(200).json({count:usercart.cartItems.length});
//     }
//     return res.status(404).send("Cart Not Found");
// }); 

router.post('/add',[auth,user],(req,res)=>{

    Cart.findOne({user:req.user._id},(err,result)=>{
        if(err) return res.status(400).json({err});
        if(result){
            const product = req.body.cartItems.product;
            const item = result.cartItems.find(c => c.product == product);
            let condition,update;
            if(item){
                condition = {"user": req.user._id,"cartItems.product":product};
                update = {
                    "$set":{
                        "cartItems.$": {
                            ...req.body.cartItems,
                            quantity: item.quantity + req.body.cartItems.quantity
                        }
                    }
                }
                
            }else{
                condition = {"user": req.user._id};
                update = {
                    "$push":{
                        "cartItems": req.body.cartItems
                    }
                };              
            }
            Cart.findOneAndUpdate(condition,update,(error,_cart)=>{
                if(error) return res.status(400).json({error});
                if(_cart){
                    Cart.findOne({user: req.user._id},(err,result)=>{
                        if(err) res.status(500).send(err); //Internal Server error
                        if(result) return res.status(201).json(result.cartItems); //Created
                    });
                }
            });
            
        }else{
            const cart = new Cart({
                user: req.user._id,
                cartItems: [req.body.cartItems]
            });
        
            cart.save((err,result)=>{
                if(err){
                    return res.status(500).send(err); //Internal server eroor
                }
                if(result){
                    return res.status(201).send(result.cartItems); //Created
                }
            });
        }
    });    

});

router.post('/delitem',[auth,user],(req,res)=>{
    Cart.findOne({user:req.user._id},(err,result)=>{
        if(err) return res.status(400).json({err});
        if(result){
            const product = req.body.cartItems.product;
            const item = result.cartItems.find(c => c.product == product);
            let condition,update;
            if(item){
                condition = {"user": req.user._id,"cartItems.product":product};
                update = {
                    "$pull":{
                        "cartItems": {
                            ...item
                        }
                    }
                }
                
            }else{
                return res.status(404).send("Item Not Found");
            }
            Cart.findOneAndUpdate(condition,update,(error,_cart)=>{
                if(error) return res.status(400).json({error});
                if(_cart){
                    Cart.findOne({user: req.user._id},(err,result)=>{
                        if(err) res.status(500).send(err); //Internal Server error
                        if(result) return res.status(201).json(result.cartItems); //Created
                    });
                }
            });
            
        }else{
            return res.status(404).send("Cart Not Found");
        }
    });    
});

exports.cartRouter = router;