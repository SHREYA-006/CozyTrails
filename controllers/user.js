const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
    return res.render("users/signup.ejs")
}

module.exports.signup=async(req,res,next)=>{
    try{
        let{username,email,password}=req.body
        const newUser=new User({username,email})
        const registerUser=await User.register(newUser,password)
        console.log(registerUser);
        return req.login(registerUser,(err)=>{
            if(err){
                return next(err)
            }
        req.flash("success","Registered Successfully!!")
        return res.redirect("/listings")
        })
        return;  // Added return here to prevent further execution and multiple responses
    }catch(e){
        req.flash("failure",e.message)
        return res.redirect("/signup")
    }
}

module.exports.renderLoginForm=(req,res)=>{
    return res.render("users/login.ejs")
}

module.exports.login=async(req,res)=>{
    req.flash("success","Welcome Back")
    let redirectUrl=res.locals.redirectUrl || "/listings";
    // delete req.session.redirectUrl; // Clear redirectUrl after redirecting
    return res.redirect(redirectUrl);// Ensure return to prevent further code execution
}

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","Logged out Successfully")
        return res.redirect("/listings")
    });
}
