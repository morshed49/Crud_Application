const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const PORT = 3001;


// middlewares
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(
    session({
        secret : "my secret key",
        saveUninitialized:true,
        resave:false,
    })
);
app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use (express.static("uploads"));

// set template engine
app.set("view engine","ejs");


// Route prefix 
app.use("", require("./route/route"));

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/node_crud");
    console.log("DB is connected");
  } catch (error) {
    console.log("DB is Not Connected");
    console.log(error);
    process.exit(1);
  }
};

app.listen(PORT, async () => {
  console.log(`This server is running at: http://localhost:${PORT}`);
  await connectDB();
});
