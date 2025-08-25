const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main(){
   await mongoose.connect("mongodb://127.0.0.1:27017/cozytrails");
}

main().then(()=>{
    console.log("database connected successfully!!!");
}).catch((err)=>{
    console.log("err");
})

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"6883c4ade601e7e5c61aa7e5"}))
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();