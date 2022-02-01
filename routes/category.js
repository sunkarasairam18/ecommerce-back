const {Category} = require("../models/category");
const slugify = require('slugify');
const express = require("express");
const router = express.Router();

router.post('/create',(req,res)=>{
    const categoryObj = {
        name: req.body.name,
        slug: slugify(req.body.name)
    }
    if(req.body.parentId){
        categoryObj.parentId = req.body.parentId;
    }
    const category = new Category(categoryObj);
    category.save((err,result)=>{
        if(err){
            return res.status(500).send(err); //Internal server eroor
        }
        if(result){
            return res.status(201).send("New Category Created Successfully!"); //Created
        }
    });
});

router.get('/get',(req,res)=>{
    try{
        const categories = await Category.find({});
        if(categories){
            return res.status(200).send(categories);
        }
    }catch(err){
        return res.status(500).send("Server error"); //Internal server error
    }

});

module.exports.categoryRouter = router;