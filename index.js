const {authRouter} = require("./routes/auth");
const {categoryRouter} = require("./routes/category"); 
const express = require('express');
const connectDb = require('./connection');
const app = express();

app.use(express.json());
connectDb();

app.use("/category",categoryRouter);
app.use("/user",authRouter);

app.get("/",(req,res)=>{
    res.status(200).send("Hello World!");
});

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

