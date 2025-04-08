const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    packs: {
        type: [Number],
        default: []
    }
});

module.exports = mongoose.model("Module", moduleSchema);