require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors()); // Erlaubt CORS für den Client

// 📌 MongoDB Verbindung
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB verbunden"))
  .catch((err) => console.log("❌ MongoDB Fehler:", err));

// 📌 User Schema
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    emailToken: { type: String },
  })
);

// 📌 Mailer-Setup (SMTP)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// 📌 Registrierung mit E-Mail-Verifikation
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailToken = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  try {
    const user = new User({ email, password: hashedPassword, emailToken });
    await user.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email.html?token=${emailToken}`;
    await transporter.sendMail({
      to: email,
      subject: "Verifiziere deine E-Mail",
      html: `<h2>Willkommen!</h2><p>Klicke <a href="${verifyLink}">hier</a>, um dein Konto zu verifizieren.</p>`,
    });

    res.json({ message: "Überprüfe deine E-Mail zur Verifikation!" });
  } catch (err) {
    res.status(400).json({ message: "E-Mail existiert bereits!" });
  }
});

// 📌 E-Mail-Verifikation
app.get("/api/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    await User.findOneAndUpdate(
      { email },
      { isVerified: true, emailToken: null }
    );
    res.json({
      message: "E-Mail verifiziert! Du kannst dich jetzt einloggen.",
    });
  } catch {
    res
      .status(400)
      .json({ message: "Ungültiger oder abgelaufener Verifikationslink." });
  }
});

// 📌 Login mit Verifikations-Check
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ message: "E-Mail nicht registriert." });
  if (!user.isVerified)
    return res
      .status(403)
      .json({ message: "Bitte verifiziere zuerst deine E-Mail." });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Falsches Passwort." });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Login erfolgreich!", token });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
