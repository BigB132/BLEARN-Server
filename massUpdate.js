const {dbURI} = require("./config.json")
const User = require("./userModel.js");
const mongoose = require("mongoose")

async function migrate() {
    await mongoose.connect(dbURI, {});
    console.log("Connected successfully to database!");
    
    //await User.updateMany({ coins: { $exists: false } }, { $set: { coins: 0 } });
    const users = await User.collection.listIndexes('test.users');
    console.log(users)

};

migrate()
