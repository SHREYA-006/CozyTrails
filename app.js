
if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}

const express=require("express");
const app=express();

app.locals.localUser = null; //updated
app.locals.success = [];
app.locals.error = [];
app.locals.failure = [];

const mongoose=require("mongoose")
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const passport=require("passport");
const LocalStrategy=require("passport-local")
const User=require("./models/user.js");

app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));

const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session")
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");

const listingsRouter=require("./routes/listing.js")
const reviewsRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js");

const db_url=process.env.ATLAS_DB_URL;
async function main(){
   await mongoose.connect(db_url);
}

main().then(()=>{
    console.log("database connected successfully!!!");
}).catch((err)=>{
    console.log(err);
})

const store=MongoStore.create({
    mongoUrl:db_url,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("error in mongo session store",err);
})

app.set("trust proxy",1);

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.failure=req.flash("failure");
    res.locals.error = req.flash("error");
    res.locals.currentUser=req.user||null;
    next();
})

app.get("/",(req,res)=>{
    res.redirect("/listings")
})
// LISTINGS ROUTES
app.use("/listings",listingsRouter);
// REVIEWS ROUTES
app.use("/listings/:id/reviews",reviewsRouter);
//User Router
app.use("/",userRouter);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
})

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something Went Wrong"}=err
    res.status(statusCode).render("error.ejs",{message})
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080..");
})
