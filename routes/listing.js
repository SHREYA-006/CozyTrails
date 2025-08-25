const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage});

router.route("/")
    //ALL LISTINGS
    .get(wrapAsync(listingController.index))
    //create route
    .post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.create))

//new route
router.get("/new",isLoggedIn,listingController.newRender);

router.route("/:id")
    //SHOW ROUTE
    .get(wrapAsync(listingController.showRender))
    //Update Route
    .put(isLoggedIn,isOwner,upload.single('listing[image][url]'),validateListing,wrapAsync(listingController.update))
    //DELETE ROUTE
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports=router;