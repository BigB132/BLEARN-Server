const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ MongoDB verbunden");
  } catch (err) {
    console.error("❌ MongoDB Verbindung fehlgeschlagen:", err);
    process.exit(1);
  }
};

module.exports = connectDB;