const mongoose = require("mongoose")

const Modules = mongoose.model("Modules", new mongoose.Schema({
    id: {type: String},
    name: {type: String},
    packs: {type: [Number]}
}));

module.exports = ("Modules", Modules);