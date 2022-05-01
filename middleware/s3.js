const aws = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")

const config = require('config');
const uuid = require("uuid").v4
const path = require("path");
const res = require("express/lib/response");


const s3 = new aws.S3({
    accessKeyId: config.get("aws.access_id"),
    secretAccessKey: config.get("aws.secret_key"),
    region: config.get("aws.region")
});
    
const upload = multer({
    storage: multerS3({
        s3:s3,
        bucket: config.get("aws.bucket_name"),        
        metadata: (req, file, cd) => {
            cd(null, {fieldName: file.fieldname})
        },
        key: async (req, file, cb) => {
            const ext = path.extname(file.originalname)
            const uniqueName = `${uuid()}${ext}`
            cb(null, uniqueName)
        },
    })
});


exports.upload = upload;

