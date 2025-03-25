const {dbURI} = require("../config.json")
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ MongoDB verbunden");
  } catch (err) {
    console.error("❌ MongoDB Verbindung fehlgeschlagen:", err);
    process.exit(1);
  }
};

module.exports = connectDB;