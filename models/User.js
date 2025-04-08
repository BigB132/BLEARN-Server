const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    mailToken: {
        type: Number
    },
    token: {
        type: String
    },
    coins: {
        type: Number,
        default: 0
    },
    coinCode: {
        type: String,
        default: "0"
    },
    modules: {
        type: [String],
        default: []
    },
    moduleTimes: {
        type: [Number],
        default: []
    }
});

module.exports = mongoose.model("User", userSchema);