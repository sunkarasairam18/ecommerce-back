const {Category} = require("../models/category");
const {auth} = require("../middleware/auth");
const {admin} = require("../middleware/admin");
const slugify = require('slugify');
const {io} = require('../sockets');
const mongoose = require('mongoose');
const {upload} = require('../middleware/upload');
// const multer = require('multer');

// const shortid = require('shortid');
// const path = require('path');

const express = require("express");
const router = express.Router();

// const storage = multer.diskStorage({
//     destination: function (req,file,cb){
//         cb(null,path.join(path.dirname(__dirname),'uploads'))
//     },
//     filename: function(req,file,cb){
//         cb(null,shortid.generate()+"-"+file.originalname)
//     }
// });

// const upload = multer({storage});

function createCategories(categories,parentId = null){
    const categoryList = [];
    let category;
    if(parentId == null){
        category = categories.filter(cat => cat.parentId == undefined);
    }else category = categories.filter(cat => cat.parentId == parentId);

    for(let cat of category){
        categoryList.push(
            {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
                parentId: parentId,
                type: cat.type,
                children: createCategories(categories,cat._id)
            }
        );
    }
        
    return categoryList;
}

const categoryStream = Category.watch();
categoryStream.on('change',async (change)=>{
    io.emit("categories_change",'changed');        
});

router.post('/create',[auth,admin],upload.single("categoryImage"),async (req,res)=>{
    const categoryObj = {
        name: req.body.name,
        slug: slugify(req.body.name)
    }
    if(req.file){
        categoryObj.categoryImage = "http://localhost:3000/public/"+req.file.filename;
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

router.get('/get',async (req,res)=>{
    try{
        const categories = await Category.find({});
        if(categories){
            const categoryList = createCategories(categories);
            return res.status(200).send(categoryList);
        }
    }catch(err){
        return res.status(500).send("Server error"); //Internal server error
    }

});

router.get('/getroute/:catId',async (req,res)=>{
    try{
        const {catId} = req.params;
        if(catId){
            let routelist = [];
            var category = await Category.findOne({_id: catId}).select({name:1,parentId:1});
            routelist.unshift(category.name);
            while(category.parentId){
                category = await Category.findOne({_id: category.parentId}).select({name:1,parentId:1});
                routelist.unshift(category.name);
            }
            return res.status(200).send(routelist);  //Succeded
        }else{
            return res.status(400).send("catId is Missing"); //Bad Request
        }
    }catch(err){
        return res.status(500).send(err);
    }
}); 

router.get('/getname/:id',async (req,res)=>{
    try{
        const {id} = req.params;
        if(id){
            const out = await Category.findOne({_id: id}).select({name:1});
            return res.status(200).send(out);
        }
    }catch(err){
        return res.status(500).send("Server error"); //Internal server error
    }
});

router.post('/update',[auth,admin],upload.array('categoryImage'),async (req,res) =>{
    const {_id,name,parentId,type} = req.body;
    const updatedCategories = [];
    try{
 
    
    if(name instanceof Array){
        for(let i = 0;i<name.length;i++){
            const category = {
                name: name[i],
                slug: slugify(name[i]),
                type: type[i]
            };
            if(parentId[i] !== ""){
                category.parentId = parentId[i];

            }
            const updated = await Category.findOneAndUpdate({_id: _id[i]},category,{new: true}).then(result=>{
                
            }).catch(err=>{
                console.log("error from catch ",category);
            });
            updatedCategories.push(updated);
            

        }     
        return res.status(200).send();  //Ok
    }else{
        const category = {
            name,
            type
        };
        if(parentId !== ""){
            category.parentId = parentId;
            const updated = await Category.findOneAndUpdate({_id},category,{new: true});
            return res.status(200).send(updated);    //Ok
        }else{
            return res.status(500).send("Server error"); //Internal server error
        }
    }
    }
    catch(err){
        console.log(err.message);
        return res.status(500).send("Server error"); //Internal server error
    }
});


router.post('/delete',async (req,res)=>{
    try{
        const {ids} = req.body.payload;
        const deletedCategories = [];
        for(let i = 0;i<ids.length;i++){
            const deleteCategory = await Category.findOneAndDelete({_id: ids[i]._id});
            deletedCategories.push(deleteCategory);
        }
        if(deletedCategories.length === ids.length){
            res.status(200).send("Categories Deleted");
        }
    }catch(err){
        return res.status(500).send("Server error"); //Internal server error
    }
    
});


module.exports.categoryRouter = router;