const Listing=require("../models/listing.js");
const axios = require("axios");

// module.exports.index=async(req,res)=>{
//     let allListing=await Listing.find();
//     return res.render("./listings/index.ejs",{allListing});
// }

module.exports.index = async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = {};
        // If a category is selected
        if (category) {
            filter.category = category;
        }
        // If search query exists
        if (search) {
            const regex = new RegExp(search, 'i'); // case-insensitive match
            filter.$or = [
                { title: regex },
                { location: regex },
                { country: regex }
            ];
        }
        const allListing = await Listing.find(filter);
        return res.render("./listings/index.ejs", {
            allListing,
            selectedCategory: category || "",
            searchQuery: search || ""
        });
    } catch (err) {
        console.error("Error loading listings:", err);
        req.flash("error", "Something went wrong while loading listings.");
        return res.redirect("/");
    }
};

module.exports.newRender=(req,res)=>{
    return res.render("./listings/new.ejs");
}

module.exports.showRender=async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id)
    .populate({path:"reviews",populate:{path:"author"}})
    .populate("owner");
    if(!list){
        req.flash("failure","This property does not exist")
        return res.redirect("/listings")
    }
    //console.log(list)
    return res.render("./listings/show.ejs",{list});
}

module.exports.create = async (req, res) => {
  try {
    let url = req.file.path;
    let filename = req.file.filename;

    // Geocoding the user-entered location
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: req.body.listing.location,  // example: "Ahmedabad, Gujarat"
        format: "json",
        limit: 1,
      },
      headers: {
        'User-Agent': 'LeafletApp/1.0',  // Nominatim requires a User-Agent
      }
    });

    if (!geoRes.data.length) {
      req.flash("error", "Location not found. Please enter a valid location.");
      return res.redirect("/listings/new");
    }

    const { lat, lon } = geoRes.data[0];

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { filename, url };

    // Set coordinates in GeoJSON format for Leaflet
    newListing.geometry = {
      type: "Point",
      coordinates: [parseFloat(lon), parseFloat(lat)],
    };

    await newListing.save();
    req.flash("success", "New Listing Created!");
    return res.redirect("/listings");
    
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while creating the listing.");
    return res.redirect("/listings/new");
  }
};

// module.exports.create=async(req,res,next)=>{
//     let url=req.file.path
//     let filename=req.file.filename
//     const newListing=new Listing(req.body.listing);
//     newListing.owner=req.user._id;
//     newListing.image={filename,url};
//     await newListing.save();
//     req.flash("success","New property added successfully!!")
//     return res.redirect("/listings");
// }

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id);
    if(!list){
        req.flash("failure","This property does not exist")
        return res.redirect("/listings")
    }
    let originalImage=list.image.url
    let originalImageUrl=originalImage.replace("/upload","/upload/w_250")
    return res.render("./listings/edit.ejs",{list,originalImageUrl});
}

module.exports.update = async (req, res) => {
  const { id } = req.params;
  try {
    const oldListing = await Listing.findById(id);
    if (!oldListing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    const updateData = { ...req.body.listing };

    // Prevent frontend from overriding geometry
    delete updateData.geometry;

    if (updateData.location) {
      const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: updateData.location,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "LeafletApp/1.0",
        },
      });

      if (geoRes.data.length) {
        const { lat, lon } = geoRes.data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        updateData.geometry = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      } else {
        req.flash("error", "Invalid location provided.");
        return res.redirect(`/listings/${id}/edit`);
      }
    } else {
      updateData.geometry = oldListing.geometry;
    }
    const list = await Listing.findByIdAndUpdate(id, updateData, { new: true });
    if (req.file) {
      list.image = {
        filename: req.file.filename,
        url: req.file.path,
      };
      await list.save();
    }

    req.flash("success", "Updated Successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Update error:", err);
    req.flash("error", "Something went wrong while updating the listing.");
    res.redirect(`/listings/${id}/edit`);
  }
};


module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Property deleted successfully!!")
    return res.redirect("/listings");
}