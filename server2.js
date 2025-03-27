const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailjet = require ('node-mailjet').connect("2f74cf55d61d7b701b4aee56a22398f5", "86321f7ce70a736e1457347e716953f9");

const {dbURI} = require("../BLEARN-Server/config.json")

const app = express();
app.use(cors()); // CORS aktivieren
app.use(express.json()); // JSON Body Parser

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Datenbank verbunden"))
    .catch(err => console.log("Fehler bei der Datenbankverbindung", err));

// User Model
const User = mongoose.model("User", new mongoose.Schema({
    //username: String,
    email: { type: String, unique: true },
    mailToken: {type: Number, required: true},
}));

// Registrierung Route
/*app.post("/api/auth/register", async (req, res) => {
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
    const mailjet = require ('node-mailjet').connect("2f74cf55d61d7b701b4aee56a22398f5", "86321f7ce70a736e1457347e716953f9")
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
});*/

// Login Route
app.post("/api/auth/login", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const mailToken = Math.floor(1000 + Math.random() * 10000);

    if (!user) {
        const newUser = new User({
            email: email,
            mailToken: mailToken,
        });
        await newUser.save();
    };

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
                    "HTMLPart": 
                        `<div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #333;">Blearn Email verification</div>
                            <p style="font-size: 18px; color: #555; margin-top: 20px;">Danke fürs registrieren bei Blearn!!!</p>
                            <p style="font-size: 18px; color: #555; margin-top: 20px;">Dein verification code ist:</p>
                            <p style="display: inline-block; padding: 24px 48px; background-color: #007bff; color: #ffffff; font-size: 32px; border-radius: 6px; margin-top: 20px; font-weight: bold;">${mailToken}</p>
                            <p style="font-size: 12px; color: #777; margin-top: 20px;">Wenn du dich nicht registriert hast, kannst du diese E-Mail ignorieren</p>
                        </div>`
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

    const token = jwt.sign({ userId: email }, "banana", { expiresIn: "1h" });
    res.json({ msg: "Login erfolgreich", token });
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});