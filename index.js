const { authRouter } = require("./routes/auth");
const { categoryRouter } = require("./routes/category"); 
const { cartRouter } = require('./routes/cart');
const { ordersRouter } = require('./routes/orders');
const { addressRouter } = require('./routes/address');
const {productRouter} = require("./routes/product");
const {pageRouter} = require("./routes/page");
const {app,httpServer} = require('./sockets');
const express = require('express');

const connectDb = require('./connection');
const cors = require('cors');


app.use(cors({
    exposedHeaders: 'x-auth-token'
}));

app.use(express.json());
connectDb();

app.use("/category",categoryRouter);
app.use("/product",productRouter);
app.use("/user",authRouter);
app.use("/order",ordersRouter);
app.use("/cart",cartRouter);
app.use('/address',addressRouter);
app.use("/page",pageRouter);

app.get("/",(req,res)=>{
    res.status(200).send("Hello World!");
});




const port = process.env.PORT || 3000;
httpServer.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});


