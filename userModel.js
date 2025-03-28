const mongoose = require("mongoose")

const UserData = mongoose.model("User", new mongoose.Schema({
    email: { type: String, unique: true },
    mailToken: {type: Number, required: true},
    token: {type: String}
}));

module.exports = ("userData", UserData);
