const {dbURI} = require("./config.json")
const User = require("./userModel.js");
const mongoose = require("mongoose")

async function migrate() {
    await mongoose.connect(dbURI, {});
    console.log("Connected successfully to database!");
    
    await User.updateMany({ coinCode: { $exists: false } }, { $set: { coinCode: 0 } });

};

migrate()
