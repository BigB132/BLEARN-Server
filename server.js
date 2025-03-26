const express = require('express');
const app = express();
const port = 3000;

// Eine Route, die die zufällige URL behandelt
app.get('/earn/:randomId', (req, res) => {
    const randomId = req.params.randomId;
    // Hier kannst du die Coins berechnen und dem Benutzer anzeigen
    res.send(`<h1>Du hast 10 Coins für das Besuchen dieser Seite verdient!</h1><p>ID: ${randomId}</p>`);
    console.log("Bannaa");
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
