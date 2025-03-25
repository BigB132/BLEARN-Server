const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dbURI =
  "mongodb+srv://hanzfranzdermaster:67Js2mfrXK5OmBE4@001.7urs2.mongodb.net/?retryWrites=true&w=majority&appName=001";

const app = express();
app.use(cors()); // CORS aktivieren
app.use(express.json()); // JSON Body Parser

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Datenbank verbunden"))
  .catch((err) => console.log("Fehler bei der Datenbankverbindung", err));

// User Model
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
  })
);

// Registrierung Route
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({ msg: "Benutzer registriert!" });
  } catch (err) {
    res.status(400).json({ msg: "Fehler bei der Registrierung" });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ msg: "Benutzer nicht gefunden!" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ msg: "Falsches Passwort!" });
  }

  const token = jwt.sign({ userId: user._id }, "PASSWORT", {
    expiresIn: "1h",
  });
  res.json({ msg: "Login erfolgreich", token });
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
