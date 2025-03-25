const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(express.json());

// MongoDB verbinden
connectDB();

// Routen
app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("🚀 Server läuft auf Port 5000"));