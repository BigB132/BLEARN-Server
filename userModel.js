const mongoose = require("mongoose")

const User = mongoose.model("User", new mongoose.Schema({
    email: { type: String, unique: true },
    mailToken: {type: Number, required: true},
    token: {type: String},
    coins: {type: Number, default: 0},
    coinCode: {type: String, default: 0},
    modules: {type: [String], default: []},
    moduleTimes: {type: [String], default: []},
}));

module.exports = ("User", User);
