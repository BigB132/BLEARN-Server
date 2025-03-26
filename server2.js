const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const {dbURI} = require("../BLEARN-Server/config.json")

const app = express();
app.use(cors()); // CORS aktivieren
app.use(express.json()); // JSON Body Parser

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Datenbank verbunden"))
    .catch(err => console.log("Fehler bei der Datenbankverbindung", err));

// User Model
const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
}));

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

    // Erstelle ein JWT-Token für die Verifizierung
    const token = jwt.sign({ email }, "banana", { expiresIn: "1h" });

    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

    // E-Mail senden
    const mailjet = require ('node-mailjet')
        .connect("2f74cf55d61d7b701b4aee56a22398f5", "86321f7ce70a736e1457347e716953f9")
    const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
            "Messages":[
                {
                    "From": {
                        "Email": "hanzfranzdermaster@gmail.com",
                        "Name": "Hanz Franz"
                    },
                    "To": [
                        {
                            "Email": email,
                            "Name": "User"
                        }
                    ],
                    "Subject": "Blearn Email Verification",
                    "TextPart": "Hey User! Click here to verify your email.",
                    "HTMLPart": "<text>Hey User! Click <a href=\"https://google.com/\">here</a> to verify your email.</text>"
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
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

    const token = jwt.sign({ userId: user._id }, "banana", { expiresIn: "1h" });
    res.json({ msg: "Login erfolgreich", token });
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});