const express = require('express');
const router = express.Router();
const config = require('config');
const {upload} = require('../middleware/upload');
const {Page} = require("../models/page");
const { auth } = require('../middleware/auth');
const {admin} = require("../middleware/admin");
const shortid = require('shortid');

router.post('/create',[auth,admin],upload.fields([{name:"banners"},{name:"products"}]),async (req,res)=>{
    try{
        const {banners,products} = req.files;
        if(banners && banners.length>0){
            req.body.banners = banners.map((banner,index)=>({
                img : `${config.get("admin_url")}/public/${banner.filename}`,
                navigateTo : `/bannerClicked?categoryId=${req.body.category}&type=${req.body.type}`
            }));
        }
        if(products && products.length>0){
            req.body.products = products.map((product,index)=>({
                img : `${config.get("admin_url")}/public/${product.filename}`,
                navigateTo : `/productClicked?categoryId=${req.body.category}&type=${req.body.type}`
            }));
        }

        req.body.createdBy = req.user._id;

        const pageExists = await Page.findOne({category: req.body.category});
        if(pageExists){
            Page.findOneAndUpdate({category: req.body.category},req.body).then(
                ()=>{
                    return res.status(205).send({page}); //Reset content
                }
            ).catch(()=>{
                return res.status(500).send(err); //Internal server error
            });
        }else{
            const page = new Page(req.body);
            page.save((err,page)=>{
                if(err){
                    return res.status(500).send(err);
                }
    
                if(page){
                    return res.status(201).send({page}); //New Resource created successfully
                }
               
                
            });
        }
        
    }catch(err){
        console.log(err);
        return res.status(500).send(err); //Internal server error
    }
});

router.get('/:category/:type',async (req,res)=>{
    try{
        const {category,type} = req.params;
        const page = await Page.findOne({category:category});
        if(page){
            return res.status(200).send({page});
    
        }
    }catch(err){
        return res.status(400).send({err});
    }
});

module.exports.pageRouter = router;