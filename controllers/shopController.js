const User = require('../models/User');
const Module = require('../models/Module');

const earnCoinsPage = async (req, res) => {
    try {
        const coincode = req.params.randomId;
        const user = await User.findOne({ coinCode: coincode });
        
        if (!user) return res.status(404).send('User not found: ' + coincode);

        res.send(`
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Earn Coins</title>
                <style>
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background-color: #181818;
                        color: white;
                        text-align: center;
                    }
                    .header {
                        padding: 50px 20px;
                    }
                    .header h1 {
                        font-size: 48px;
                        margin-bottom: 10px;
                    }
                    .header p {
                        font-size: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .btn-container {
                        margin-top: 30px;
                    }
                    .btn {
                        display: inline-block;
                        padding: 12px 24px;
                        font-size: 18px;
                        color: white;
                        text-decoration: none;
                        background-color: #c200cc;
                        border-radius: 8px;
                        transition: background 0.3s, box-shadow 0.3s;
                        cursor: pointer;
                        border: none;
                    }
                    .btn:hover {
                        background: #a000aa;
                        box-shadow: 0 0 15px #c200cc;
                    }
                    #message {
                        margin-top: 20px;
                        font-size: 18px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BLEARN</h1>
                    <p>Klicke den Button, um deine Belohnung zu erhalten!</p>
                </div>
                <div class="btn-container">
                    <button class="btn" onclick="claimReward()">Belohnung erhalten</button>
                </div>
                <p id="message"></p>
                <script>
                    const coincode = "${coincode}"; // Die Variable außerhalb des Fetch-Calls setzen
                    async function claimReward() {
                        const response = await fetch(\`https://blearn-server.onrender.com/claim/\${coincode}\`, {
                            method: 'POST',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ coincode: coincode })
                        });
                        const data = await response.json();
                        if (data.msg === "success") {
                            document.getElementById("message").innerText = "Belohnung erfolgreich eingelöst!";
                            setTimeout(() => {
                                window.location.href = "https://blearn.netlify.app";
                            }, 1500);
                        } else {
                            document.getElementById("message").innerText = "Fehler beim Einlösen. Versuche es erneut.";
                        }
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Error displaying coin page:", error);
        res.status(500).send("Server error");
    }
};

const claimCoins = async (req, res) => {
    try {
        const { coincode } = req.body;
        const user = await User.findOne({ coinCode: coincode });
        
        if (!user) return res.json({ msg: "User not found" });

        user.coinCode = "0"; // Deactivate the code after use
        user.coins += 10;
        await user.save();

        res.json({ msg: "success" });
    } catch (error) {
        console.error("Error claiming coins:", error);
        res.status(500).json({ msg: "Server error" });
    }
};

const buyModule = async (req, res) => {
    try {
        const module = req.params.module;
        const pack = Number(req.params.pack);
        const { token, email } = req.query;

        const user = await User.findOne({ token, email });
        if (!user) {
            return res.json({ msg: "NoUser" });
        }
        
        const moduleData = await Module.findOne({ id: module });
        if (!moduleData) {
            return res.json({ msg: "NoModule" });
        }
        
        const price = moduleData.packs[pack];
        const coins = user.coins;

        if (price > coins) {
            return res.json({ msg: "NEC" });s
        } else {
            // Calculate access time based on pack
            let accessTime;
            switch (pack) {
                case 0: accessTime = Date.now() + 30 * 60 * 1000; break; // 30 minutes
                case 1: accessTime = Date.now() + 60 * 60 * 1000; break; // 1 hour
                case 2: accessTime = Date.now() + 4 * 60 * 60 * 1000; break; // 4 hours
                case 3: accessTime = Date.now() + 24 * 60 * 60 * 1000; break; // 24 hours
                case 4: accessTime = Date.now() + 7 * 24 * 60 * 60 * 1000; break; // 7 days
                case 5: accessTime = Date.now() + 28 * 24 * 60 * 60 * 1000; break; // 28 days
            }

            user.coins -= price;
            user.modules.push(module);
            user.moduleTimes.push(accessTime);
            await user.save();

            res.send(`
                <!DOCTYPE html>
                <html lang="de">
                <head></head>
                <body>
                <script>
                    window.onload = async function() {
                        window.location.href = 'https://blearn.netlify.app/dashboard';
                    }
                </script>
                </body>
                </html>`);
        }
    } catch (error) {
        console.error("Error buying module:", error);
        res.status(500).json({ msg: "Server error" });
    }
};

const fetchProjects = async (req, res) => {
    try {
        const { email, token } = req.body;
        const user = await User.findOne({ email, token });
        
        if (!user) return res.status(404).json({ error: 'User not found' });

        let outputArray = [];
        let names = [];
        
        // Use a for...of loop to handle asynchronous operations
        for (let index = 0; index < user.modules.length; index++) {
            const item = user.modules[index];
            const time = user.moduleTimes[index];
            
            if (time < Date.now()) {
                // Remove expired modules
                user.modules.splice(index, 1);
                user.moduleTimes.splice(index, 1);
                index--; // Prevent skipping the next element
            } else {
                if (outputArray.includes(item)) continue; // Prevent duplicate modules
                outputArray.push(item);
                
                const moduleData = await Module.findOne({ id: item });
                if (moduleData) {
                    names.push(moduleData.name);
                }
            }
        }
        
        // Save after the loop
        await user.save();
        res.json({ output: outputArray, names: names });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    earnCoinsPage,
    claimCoins,
    buyModule,
    fetchProjects
};