const express = require('express');
const router = express.Router();
const { user } = require('../middleware/user');
const { auth } = require("../middleware/auth");
const { Address } = require('../models/address');

router.post('/add',[auth, user],async (req,res)=>{
    try{
        const address = await Address.findOne({user: req.user._id});
        if(address){
            const { _id } = req.body.address;
            const add_item = address.AddressList.find(c => c._id == _id);
            let condition,update;
            if(add_item){
                condition = {"user": req.user._id,"AddressList._id": _id};
                update = {
                    "$set":{
                        "AddressList.$": {
                            ...req.body.address                            
                        }
                    }
                }
            }else{
                condition = {"user": req.user._id};
                update = {
                    "$push":{
                        "AddressList": req.body.address  
                    }
                };              
            }
            Address.findOneAndUpdate(condition,update,{new: true},(error,_address)=>{
                if(error) return res.status(400).json({error});
                if(_address){
                    
                    return res.status(201).json(_address);
                }
            });

        }else{
            const new_address = new Address({
                user: req.user._id,
                AddressList: [req.body.address]
            });
            
            new_address.save((err,result)=>{
                if(err){
                    return res.status(500).send(err); //Internal server eroor
                }
                if(result){
                    return res.status(201).send("Address Added"); //Created
                }
            });
        }
    }catch(err){
        return res.status(500).send(err); //Internal Server error
    }
});

exports.addressRouter = router;