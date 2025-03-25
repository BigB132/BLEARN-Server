const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userData");

// 🔹 Registrierung
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Benutzer existiert bereits" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "Benutzer registriert!" });
  } catch (err) {
    res.status(500).json({ msg: "Serverfehler" });
  }
};

// 🔹 Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Benutzer nicht gefunden" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Falsches Passwort" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Serverfehler" });
  }
};

module.exports = { registerUser, loginUser };
