const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const mailjet = require ('node-mailjet').connect("2f74cf55d61d7b701b4aee56a22398f5", "86321f7ce70a736e1457347e716953f9");
const User = require("./userModel");
const Modules = require("./moduleDataModel");
require('./docsCode.js');


const {dbURI} = require("./config.json")

const app = express();

const corsOptions = {
    origin: "*", // Alternativ eine spezifische Domain angeben
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
};

// CORS aktivieren
app.use(cors(corsOptions));

// Preflight-Anfragen explizit erlauben
app.options("*", cors(corsOptions));


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
    if(Number(user.mailToken) !== Number(mailToken)) return res.status(400).json({msg: `fail`});
    
    function generateToken(length = 25) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
    const { token, email, coincode } = req.body;

    const user = await User.findOne({token: token, email: email});
    if(user){
        if(coincode){
            user.coinCode = coincode;
            await user.save();
        };
        res.json({msg: "success", coins: user.coins})
    } else {
        res.json({ msg: "fail"})
    };
});

app.get('/earn/:randomId', async (req, res) => {
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
});

app.post('/claim/:randomId', async (req, res) => {
    const {coincode} = req.body;
    const user = await User.findOne({ coinCode: coincode });
    if (!user) return res.json({ msg: "User not found" });

    user.coinCode = "0"; // Deaktiviere den Code nach der Nutzung
    user.coins += 10;
    await user.save();

    res.json({ msg: "success" });
});

app.get('/api/shop/buy/:module/:pack', async (req, res) => {
    const module = req.params.module;
    const pack = req.params.pack;
    const { token, email } = req.query;

    const user = await User.findOne({token: token, email: email});
    if(!user) {
        res.json({msg: "NoUser"});
        return;
    }
    const packId = Number(pack);
    const coins = user.coins;
    const moduleData = await Modules.findOne({id: module});
    if(!moduleData){
        res.json({msg: "NoModule"});
        return;
    }
    const price = moduleData.packs[packId];

    if(price > coins){
        res.json({msg: "NEC"});
        return;
    } else {
        user.coins -= price;
        user.modules.push(module);
        if(packId === 0) user.moduleTimes.push(Date.now() + 30 * 60 * 1000);
        if(packId === 1) user.moduleTimes.push(Date.now() + 60 * 60 * 1000);
        if(packId === 2) user.moduleTimes.push(Date.now() + 4 * 60 * 60 * 1000);
        if(packId === 3) user.moduleTimes.push(Date.now() + 24 * 60 * 60 * 1000);
        if(packId === 4) user.moduleTimes.push(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if(packId === 5) user.moduleTimes.push(Date.now() + 28 * 24 * 60 * 60 * 1000);

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
            </html>`)
    }
});

// Sample documentation data
const documentationData = {
  categories: [
    {
      id: 'deutsch',
      name: 'Deutsch',
      subcategories: [
        {
          id: 'DGe',
          name: 'Berichten & Argumentieren',
          chapters: [
            { id: 'bericht-verfassen', name: 'Einen Bericht verfassen' },
            { id: 'brief-schreiben', name: 'Ein Brief schreiben' },
            { id: 'wegbeschreibung-schreiben', name: 'Eine Wegbeschreibung schreiben' },
            { id: 'meinung-begründen', name: 'Meinungen Begründen'}
          ]
        },
        {
          id: 'spannend-erzaehlen',
          name: 'Spannend Erzählen',
          chapters: [
            { id: 'aufbau-einer-erzählung', name: 'Aufbau einer spannenden Erzählung' },
            { id: 'spannende-einleitung-schreiben', name: 'Eine spannende Einleitung schreiben' },
            { id: 'hauptteil-schreiben', name: 'Den Hauptteil schreiben'},
            { id: 'spannenden-schluss-schreiben', name: 'Einen guten Schlussteil schreiben'},
            { id: 'tipps-für-eine-spannende-erzählung', name: 'Weitere wichtige Tipps'}
          ]
        }
      ]
    },
    {
      id: 'latein',
      name: 'Latein',
      subcategories: [
        {
          id: 'l1',
          name: 'Einführung',
          chapters: [
            { id: 'l1.1', name: 'Satzglieder, Wortarten, Formen' },
            { id: 'l1.2', name: 'Akkusative und Deklinationen' },
            { id: 'l1.3', name: 'Das Genus' },
            { id: 'l1.4', name: 'Konjugieren'}
          ]
        },
      ]
    },
  ]
};

// Content data for each section
const contentData = {
  'DGe': `
    <h1 class="doc-title">Berichten und Argumentieren</h1>
    <div class="doc-content">
      <h3 id="bericht-verfassen">Einen Bericht verfassen</h3>
      <p>Ein Bericht informiert knapp und sachlich über ein Ereignis. Ein Bericht beantwortet die wichtigsten W-Fragen (Wer? Was? Wann? Wo? Warum? Wie?), steht im Präteritum und hat eine kurze informative Überschrift.</p>

      <h3 id="brief-schreiben">Einen Brief schreiben</h3>
      <p>Der Aufbau eines Briefes sieht wie folgt aus:</p>
      <p>1. Ort und Datum (durch ein Komma getrennt)</p>
      <p>2. Anrede und danach ein Komma. Z.B. "Lieber Tim<b>,</b></p>
      <p>3. Inhalt (auch Brieftext genannt)</p>
      <p>4. Grußformel + Unterschrift</p>
      <br>
      <p>Tipps:</p>
      <p>1. Gehe auf Fragen des Empfängers ein (wenn vorhanden)</p>
      <p>2. Teile Gefühle, Gedanken oder Neuigkeiten mit</p>
      <p>3. Stelle am Ende des Inhalt Fragen</p>

      <h3 id="wegbeschreibung-schreiben">Eine Wegbeschreibung schreiben</h3>
      <p>Eine Wegbeschreibung sollte genau und anschaulich sein, damit auch Leute die sich in einer Gegend nicht auskennen, den Weg finden können.</p>
      <br>
      <p>Tipps:</p>
      <p>1. Beschreibe die Strecke vom Ausgangspunkt bis zum Ziel möglichst genau</p>
      <p>2. Nenne auffällige Punkte, wie z.B. Kreuzungen</p>
      <p>3. Nutze Wörter die die Richtung angeben, wie z.B. rechts, links oder geradeaus</p>
      <p>4. Nutze Wörter die die zeitliche Reihenfolge genauer beschreiben (wie z.B. dann oder darauf)</p>
      <p>5. Schreibe im Präsens</p>

      <h3 id="meinung-begründen">Meinungen Begründen</h3>
      <p>In einem Gespräch oder einer Diskussion gibt es oft unterschiedliche Meinungen. Um die anderen von der eigenen Meinung zu überzeugen, braucht man gute Argumente.</p>
      <br>
      <p>Meinung: Wir sollten mehr für die Umwelt und das Klima tun</p>
      <p>Argumente: Weil wir unsere Umwelt für die zukünfigen Generationen erhalten müssen.</p>
      <br>
      <p>Argumente kann man gut mit weil, da, oder denn einleiten.</p>
    </div>
  `,
  
  'l1': `
      <h1 class="doc-title">Einführung</h1>
          <div class="doc-content">
            <h3 id="l1.1">
              Satzglieder, Wortarten, Formen
            </h3>
            <span style="color: #037cff">Puella </span
            ><span style="color: #e20000">cantat</span>. -
            <span style="color: #037cff">Das Mädchen </span
            ><span style="color: #e20000">singt</span>.
            <p>
              <br />Dies ist der erste lateinische Satz den du hier lernst.
              „Puella“ heißt „Mädchen“ und „cantat“ heißt „singt“.
            </p>
            <p>
              Was fällt dir auf? Im Lateinischen gibt es keine Artikel (der,
              die, das)!
            </p>
            <span style="color: #037cff">Puella </span>ist in diesem Satz ein
            <span style="color: #037cff">Substantiv</span>, also das
            Hauptwort.<span style="color: #e20000">Cantat </span>ist ein
            <span style="color: #e20000">Verb</span>.
            <p><br /></p>
            <p>
              <b>Satzglieder:</b> In dem Satz gibt es zwei Satzglieder: Das
              Mädchen | singt.
            </p>
            <span style="color: #037cff">Das Mädchen </span>ist ein Subjekt. Das
            Subjekt ist eines der wichtigsten Satzglieder. Es beschreibt wer
            oder was handelt. Man erfragt es mit „Wer oder was tut etwas?“.
            <p>Ein Satzglied kann aus einem oder mehreren Wörtern bestehen.</p>
            <p><br /></p>
            <span style="color: #e20000">singt </span>ist ein Prädikat. Es sagt
            aus, was das Subjekt (Das Mädchen) tut. Man erfragt es mit „Was tut
            das Mädchen?“. Du musst natürlich das Mädchen mit dem Subjekt
            ersetzen.
            <p><br /></p>
            <p>
              Ein Satzglied kann aus einem oder mehreren Wörtern bestehen. Ein
              Satz besteht mindestens aus einem Subjekt und Prädikat.
            </p>
            <p></p>
            <p>
              <b>Formen:</b> Das Substantiv
              <span style="color: #037cff">Puella </span>steht im Nominativ.
              Dieser ist einer von fünf Fällen. Dazu später aber mehr. Da
              <span style="color: #e20000">cantat </span>ein Verb ist, hat es
              keinen Kasus.
            </p>
            <h3 id="l1.2">
              Akkusative und Deklinationen
            </h3>
            <span style="color: #006fff">Servus </span
            ><span style="color: #fff000">epuum </span
            ><span style="color: #e20000">videt</span>. -
            <span style="color: #006fff">Der Sklave </span
            ><span style="color: #e20000">sieht </span
            ><span style="color: #fff000">das Pferd</span>.
            <p>
              In diesem Satz gibt es diesmal drei Satzglieder: Servus | equum |
              videt.
            </p>
            <span style="color: #006fff">Servus</span>: Ist ein Subjekt wie wir
            es bereis oben gelernt haben.<br /><br /><span
              style="color: #fff000"
              >Equum</span
            >: Ist ein neuer Kasus. Der „Akkusativ“. Das Akkusativobjekt im Satz
            ist dazu da, die Handlung, also was der Sklave tut näher zu
            beschreiben. Anstatt zu sagen, dass der Sklave sieht, kann man mit
            dem Akkusativobjekt beschreiben, was der Sklave sieht, also das
            Pferd.<br /><br /><span style="color: #e20000">Videt</span>: Ist das
            Prädikat, welches wir schon weiter oben kennengelernt haben.<br />
            <p>
              Man erkennt das Akkusativobjekt an seiner eigenen Endung. Die
              Grundform ist „Equus“, aber der Akkusativ von Equus ist „Equum“.
              Ausserdem gehört „Equus“ in die o-Deklination. Deklinationen sind
              Gruppen von Wörtern. Es gibt die o-Dekl, die a-Dekl, und die
              konsonantische Deklination. Die Endungen sind bei allen innerhalb
              der Gruppen/Deklinationen gleich. Du kannst die Endungen aus
              dieser Tabelle entnehmen:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Kasus</th>
                  <th>o-Dekl.</th>
                  <th>a-Dekl.</th>
                  <th>kons.-Dekl.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Nominativ</th>
                  <td>equ-<b>us</b></td>
                  <td>puell-<b>a</b></td>
                  <td>pater</td>
                </tr>
                <tr>
                  <th>Akkusativ</th>
                  <td>equ-<b>um</b></td>
                  <td>puell-<b>am</b></td>
                  <td>patr-<b>em</b></td>
                </tr>
              </tbody>
            </table>
            <h3 id="l1.3">Das Genus</h3>
            <p>
              Neben den Denkinationen kann man ein Nomen auch einem bestimmten
              Geschlecht zuordnen.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Wort</th>
                  <th>Geschlecht</th>
                  <th>Übersetzung</th>
                  <th>Erklärung</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>equus</td>
                  <td>m.</td>
                  <td>das Pferd</td>
                  <td>m. = Maskulinum</td>
                </tr>
                <tr>
                  <td>puella</td>
                  <td>f.</td>
                  <td>das Mädchen</td>
                  <td>f. = Femininum</td>
                </tr>
                <tr>
                  <td>templum</td>
                  <td>n.</td>
                  <td>der Tempel</td>
                  <td>n. = Neutrum</td>
                </tr>
              </tbody>
            </table>
            <p>
              Das Geschlecht muss man einfach (genauso wie die Übersetzung) mit
              lernen. Manchmal stimmt es mit dem Deutschen Geschlecht überein,
              aber leider nicht immer.
            </p>
            <h3 id="l1.4">Konjugieren</h3>
            <p>
              Konjugieren ist ähnlich wie das Deklinieren, nur dass man hier mit
              Verben arbeitet. Auch Verben haben unterschiedliche Endungen, die
              man lernen muss. In den obigen zwei Sätzen handelt es sich um die
              <b>3. Person Singular Präsens</b>. Diese endet immer auf „-t“
            </p>
            <p>
              Allerdings kann man nicht einfach ein -t hintendran hängen,
              sondern gibt es auch beim Konjugieren (genauso wie beim
              Deklinieren) Gruppen. Diese muss man mit lernen, oder man kann sie
              auch an den Endungen ihreres Stammes erkennen:
            </p>
            <p>- a-Konj.: rogat</p>
            <p>- e-Konj.: videt</p>
            <p>- i-Konj.: audit</p>
            <p>- kons.-Konj: quaerit</p>
            <p>
              Du kannst die Endungen aus der untenstehenden Tabelle entnehmen:
            </p>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>a-Konj.</th>
                  <th>e-Konj.</th>
                  <th>i-Konj.</th>
                  <th>kons.-Konj.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>3. Person Singular</th>
                  <td>roga-<b>t</b></td>
                  <td>vide-<b>t</b></td>
                  <td>audi-<b>t</b></td>
                  <td>quaer-<b>i</b>-<b>t</b></td>
                </tr>
              </tbody>
            </table>
            <p>
              Das „-i-“ bei quaerit ist ein Bindevokal. Es erleichtert die
              Aussprache des Wortes.
            </p>
            <p>
              Achtung: Deklinieren und konjugieren sind zwei komplett
              unterschiedliche Dinge. Deklinieren tut man mit Nomen, und
              konjugieren mit Verben!
            </p>
            <p>Jetzt können wir den Satz von oben vollständig bestimmen!</p>

            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Servus</th>
                  <th>equum</th>
                  <th>videt</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Satzglied</th>
                  <td>Subjekt</td>
                  <td>(Akkusativ)Objekt</td>
                  <td>Prädikat</td>
                </tr>
                <tr>
                  <th>Wortart</th>
                  <td>Substantiv</td>
                  <td>Substantiv</td>
                  <td>Verb</td>
                </tr>
                <tr>
                  <th>Form</th>
                  <td>Nominativ<br />Singular<br />Maskulinum</td>
                  <td>Akkusativ<br />Singular<br />Maskulinum</td>
                  <td>3. Person<br />Singular<br />Präsens</td>
                </tr>
              </tbody>
            </table>
          </div>
  `
    
};

// Endpoints
// Get documentation structure
app.get('/api/documentation/structure', (req, res) => {
  res.json({ categories: documentationData.categories });
});

// Get content for a specific section
app.get('/api/documentation/content/:sectionId/:email/:token', async (req, res) => {
  const { sectionId, email, token } = req.params;

  const user = await User.findOne({email: email, token: token, modules: sectionId});

  const index = user.modules.indexOf(sectionId);

  if(user.moduleTimes[index] > Date.now() || !user){
    if (contentData[sectionId]) {
      res.json({ content: contentData[sectionId] });
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } else {
    res.status(404).json({error: 'Du hast diesen Inhalt nicht freigeschaltet'})
  }
});

// Search functionality
app.get('/api/documentation/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  
  if (!query || query.length < 2) {
    return res.json([]);
  }
  
  const results = [];
  
  // Search through subcategories
  documentationData.categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      if (subcategory.name.toLowerCase().includes(query)) {
        results.push({
          id: subcategory.id,
          name: subcategory.name,
          type: 'subcategory',
          category: category.name
        });
      }
      
      // Search through chapters
      subcategory.chapters?.forEach(chapter => {
        if (chapter.name.toLowerCase().includes(query)) {
          results.push({
            id: chapter.id,
            name: chapter.name,
            type: 'chapter',
            parentId: subcategory.id,
            parentName: subcategory.name,
            category: category.name
          });
        }
      });
    });
  });
  
  // Also search through content (simplified)
  Object.entries(contentData).forEach(([sectionId, content]) => {
    if (content.toLowerCase().includes(query)) {
      // Find the section info
      let foundSection = null;
      
      documentationData.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          if (subcategory.id === sectionId && !results.some(r => r.id === sectionId)) {
            foundSection = {
              id: sectionId,
              name: subcategory.name,
              type: 'subcategory',
              category: category.name
            };
          }
        });
      });
      
      if (foundSection) {
        results.push(foundSection);
      }
    }
  });
  
  res.json(results);
});

app.listen(3000, () => {
    console.log(`Server läuft auf Port ${3000}`);
});
