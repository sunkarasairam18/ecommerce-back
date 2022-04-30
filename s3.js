const aws = require("aws-sdk")
const multer = require("multer")
const multerS3 = require("multer-s3")

const config = require('config');
// const fs = require('fs');
const uuid = require("uuid").v4
const path = require("path");
const res = require("express/lib/response");

// const s3 = new S3({
//     config.get("aws.region"),
//     config.get("aws.access_id"),
//     config.get("aws.secret_key")
// });

// function uploadFile(file){
//     const fileStream = fs.createReadStream(file.path);

//     const uploadParams = {
//         Bucket: config.get("aws.bucket_name"),
//         Body: fileStream,
//         Key: file.filename
//     }

//     return s3.upload(uploadParams).promise();
// }




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

const getFile = async (key) =>{

    const getParams = {
        Bucket: config.get("aws.bucket_name"), //replace example bucket with your s3 bucket name
        Key: key // replace file location with your s3 file location
    };
    return await s3.getObject(getParams).createReadStream();   
}


exports.upload = upload;
exports.getImage = getFile;

