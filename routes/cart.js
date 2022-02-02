const express = require('express');
const router = express.Router();
const { user } = require('../middleware/user');
const {auth} = require("../middleware/auth");
const {Cart} = require('../models/cart');

router.post('/add',[auth,user],async (req,res)=>{

    Cart.findOne({user:req.user._id},(err,result)=>{
        if(err) return res.status(400).json({err});
        if(result){
            const product = req.body.cartItems.product;
            const item = result.cartItems.find(c => c.product == product);
            if(item){
                Cart.findOneAndUpdate({"user": req.user._id,"cartItems.product":product},{
                    "$set":{
                        "cartItems.$": {
                            ...req.body.cartItems,
                            quantity: item.quantity + req.body.cartItems.quantity
                        }
                    }
                },(error,_cart)=>{
                    if(error) return res.status(400).json({error});
                    if(_cart){
                        return res.status(201).json({_cart});
                    }
                });
            }else{
                Cart.findOneAndUpdate({user: req.user._id},{
                    "$push":{
                        "cartItems": req.body.cartItems
                    }
                },(error,_cart)=>{
                    if(error) return res.status(400).json({error});
                    if(_cart){
                        return res.status(201).json({cart});
                    }
                });
            }
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
                    return res.status(201).send(cart); //Created
                }
            });
        }
    });


    

});

exports.cartRouter = router;