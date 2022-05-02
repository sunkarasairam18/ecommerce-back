const express = require("express");
const router = express.Router();
const { Order } = require('../models/orders');
const { Product } = require('../models/product');
const { Cart } = require('../models/cart');

const { user } = require('../middleware/user');
const { auth } = require("../middleware/auth");

router.post("/create",[auth,user],async (req,res)=>{
    const { orderedItems,address } = req.body;
    if(orderedItems && address){
        try{
            for(let i = 0;i<orderedItems.length;i++){
                let product = await Product.findOne({_id: orderedItems[i].product}).select({quantity: 1});
                if(product.quantity<orderedItems[i].quantity) return res.status(409).send(orderedItems[i].product) //The request could not be completed due to a conflict with the current state of the target resource.
            }
            const order = new Order({
                user: req.user._id,
                orderedItems: orderedItems,
                address: address
            });   // Reduction in products quantity at warehouse is not done
            const saved = await order.save();
            if(saved){
                let del = await Cart.deleteOne({user: req.user._id});
                if(del){
                    res.status(200).send(saved);
                }
            }
        }catch(err){
            return res.status(500).json({err}); //Internal server error
        }
    }else return res.status(400).send("OrderedItems or address is missing"); // Bad Request
});

router.get("/get",[auth,user],async (req,res)=>{
    try{
        const orders = await Order.find({user: req.user._id}).sort({createdAt: -1}).select({orderedItems: 1,address: 1,createdAt: 1});
        if(orders){
            let i = orders.length;
            let refinedOrders = [];
            for(let j = 0;j<i;j++){
                let optOrder = {...orders[j]._doc};
                let listitems = [];
                var items = [...orders[j]._doc.orderedItems];
                // console.log(j,optOrder);
                for(let k = 0;k<items.length;k++){
                    let product = await Product.findOne({_id: items[k].product}).select({name:1,price:1,slug:1,productPictures:1});
                    // optOrder.orderedItems[k] = {...optOrder.orderedItems[k],name:product.name,price: product.price,slug: product.slug}; 
                    if(product){
                        newObj = {
                            product: optOrder.orderedItems[k].product,
                            quantity: optOrder.orderedItems[k].quantity,
                            name: product.name,
                            price: product.price,
                            slug: product.slug,
                            img: product.productPictures[0].img
                        };
                        listitems.push(newObj);
                        // optOrder.orderedItems[k]["name"] = product.name;
                        // optOrder.orderedItems[k]["price"] = product.price;
                        // optOrder.orderedItems[k]["slug"] = product.slug;
                    }

                    // console.log(listitems,product);
                }
                optOrder.orderedItems = [...listitems];
                refinedOrders.push(optOrder);
            }
            return res.status(200).send(refinedOrders);            
        }else return res.status(404).send("Orders Not found"); //server did not find a current representation for the target resource 
    }catch(err){
        console.log(err);
        return res.status(500).send(err); //Internal Server Error
    }
});


exports.ordersRouter = router;