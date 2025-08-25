const Review=require("../models/review.js");
const Listing=require("../models/listing.js");

module.exports.addReview=async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id
    listing.reviews.push(newReview._id)
    await newReview.save()
    await listing.save()
    //console.log("review saved")
    req.flash("success","Review added successfully!!")
    return res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview=async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted successfully!!")
    return res.redirect(`/listings/${id}`)
}
