const {Category} = require("../models/category");
const {auth} = require("../middleware/auth");
const {admin} = require("../middleware/admin");
const slugify = require('slugify');

const multer = require('multer');

const shortid = require('shortid');
const path = require('path');

const express = require("express");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,path.join(path.dirname(__dirname),'uploads'))
    },
    filename: function(req,file,cb){
        cb(null,shortid.generate()+"-"+file.originalname)
    }
});

const upload = multer({storage});

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
                children: createCategories(categories,cat._id)
            }
        );
    }
        
    return categoryList;
}

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

module.exports.categoryRouter = router;