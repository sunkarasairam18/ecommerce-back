const mongoose = require("mongoose");
const config = require('config');

if(!config.get("db.password")){
    console.log("Password Environment variable not defined");
    return process.exit(0);
}
if(!config.get("db.username")){
    console.log("Username Environment variable not defined");
    return process.exit(0);
}

const URI = `mongodb+srv://${config.get("db.username")}:${config.get("db.password")}@cluster0.ct1mu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const connectDB = async () =>{
    await mongoose.
    connect(URI)
    .then(()=>{
        console.log('Connected to Mongodb');
    }).catch((err) => {
        console.error('Cannot Connected to Database',err);
        return process.exit(0);
    });
};

module.exports = connectDB;
