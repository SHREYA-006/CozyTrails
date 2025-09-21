const { promiseImpl } = require("ejs");
const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
    return res.render("users/signup.ejs")
}

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registerUser = await User.register(newUser, password);

    // Wrap req.login inside a Promise
    await new Promise((resolve, reject) => {
      req.login(registerUser, (err) => {
        if (err) {
          console.log("[SIGNUP ERROR] req.login failed:", err);
          return reject(err);
        }
        resolve();
      });
    });

    req.flash("success", "Registered Successfully!!");
    console.log("[SIGNUP SUCCESS] Redirecting to /listings");
    return res.redirect("/listings");

  } catch (e) {
    req.flash("failure", e.message);
    console.log("[SIGNUP FAILURE] Redirecting to /signup:", e.message);
    return res.redirect("/signup");
  }
};

module.exports.renderLoginForm=(req,res)=>{
    return res.render("users/login.ejs")
}

module.exports.login = async (req, res, next) => {
  try {
    req.flash("success", "Welcome Back");

    let redirectUrl = res.locals.redirectUrl || "/listings";
    console.log("[LOGIN SUCCESS] Redirecting to:", redirectUrl);

    return res.redirect(redirectUrl);

  } catch (e) {
    console.log("[LOGIN ERROR]", e);
    req.flash("failure", "Login failed");
    return res.redirect("/login");
  }
};

// module.exports.login=async(req,res)=>{
//     req.flash("success","Welcome Back")
//     let redirectUrl=res.locals.redirectUrl || "/listings";
//     // delete req.session.redirectUrl; // Clear redirectUrl after redirecting
//     return res.redirect(redirectUrl);// Ensure return to prevent further code execution
// }

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","Logged out Successfully")
        return res.redirect("/listings")
    });
}
