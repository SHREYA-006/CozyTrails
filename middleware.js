const Listing=require("./models/listing.js")
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const {reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You are not logged in");
        return res.redirect("/login")
    }
    return next()
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        delete req.session.redirectUrl; // Clear redirectUrl after using it
    }
    return next()
}

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params
    let list=await Listing.findById(id);
    if(!list || !list.owner){
        req.flash("failure","Property not found");
        return res.redirect("/listings");
    }
    if(!list.owner._id.equals(res.locals.currentUser._id)){
        req.flash("failure","You are not the host of this property");
        return res.redirect(`/listings/${id}`);
    }
    return next()
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params
    let review=await Review.findById(reviewId);
    if(!review || !review.author){
        req.flash("failure","Review not found");
        return res.redirect(`/listings/${id}`);
    }
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("failure","You are not the author of this review you can't delete it");
        return res.redirect(`/listings/${id}`);
    }
    return next()
}

module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);//for server side validations
    if(error){
        return next(new ExpressError(400,error));
    }else{
        return next()
    }
};

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);//for server side validations
    if(error){
        return next(new ExpressError(400,error));
    }else{
        return next()
    }
};
