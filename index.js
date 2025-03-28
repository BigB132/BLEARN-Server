const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const mailjet = require ('node-mailjet').connect("2f74cf55d61d7b701b4aee56a22398f5", "86321f7ce70a736e1457347e716953f9");
const User = require("./userModel");

const {dbURI} = require("./config.json")

const app = express();
app.use(cors()); // CORS aktivieren
app.use(express.json()); // JSON Body Parser

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Datenbank verbunden"))
    .catch(err => console.log("Fehler bei der Datenbankverbindung", err));


// Login Route
app.post("/api/auth/login", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const mailToken = Math.floor(1000 + Math.random() * 9000);

    if (!user) {
        const newUser = new User({
            email: email,
            mailToken: mailToken,
        });
        await newUser.save();
    } else {
        user.mailToken = mailToken;
        await user.save();
    }

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

app.post("/api/auth/verify", async (req, res) => {
    const { email, mailToken } = req.body;
    const user = await User.findOne({ email });

    if(!user) return res.status(400).json({msg: "No user"});
    if(Number(user.mailToken) !== Number(mailToken)) return res.status(400).json({msg: `Wrong token: ${user.mailToken}/${mailToken}`});
    
    function generateToken(length = 25) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
        let token = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            token += characters[randomIndex];
        }

        console.log(`Created Token: ${email}:${token}`);
        return token;
    }

    const token = generateToken();
    
    user.token = token;
    await user.save()

    res.json({ msg: "success", token });
});

app.post("/api/auth/checktoken", async (req, res) => {
    const { token, email } = req.body;

    const user = await User.findOne({token: token, email: email});
    if(user){
        res.json({msg: "success", coins: user.coins})
    } else {
        res.json({ msg: "fail"})
    };
});

app.post("/api/earncoins", async (req, res) => {
    const {token, email, code} = req.body;

    const user = await User.findOne({token: token, email: email});
    if(!user) return;

    user.coinCode = code;
    await user.save();
});

app.get('/earn/:randomId', (req, res) => {
    const randomId = req.params.randomId;
    // Hier kannst du die Coins berechnen und dem Benutzer anzeigen
    res.send(`<h1>Du hast 10 Coins für das Besuchen dieser Seite verdient!</h1><p>ID: ${randomId}</p>`);
    console.log("Bannaa");
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
