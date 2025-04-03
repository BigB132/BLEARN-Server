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
          id: 'core-api',
          name: 'Core API',
          chapters: [
            { id: 'core-api-authentication', name: 'Authentication' },
            { id: 'core-api-requests', name: 'Requests & Responses' },
            { id: 'core-api-errors', name: 'Error Handling' }
          ]
        },
        {
          id: 'advanced-api',
          name: 'Advanced API',
          chapters: [
            { id: 'advanced-api-batching', name: 'Request Batching' },
            { id: 'advanced-api-webhooks', name: 'Webhooks' }
          ]
        }
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
  
  'quick-start': `
    <h1 class="doc-title">Quick Start Guide</h1>
    <div class="doc-content">
      <p>Get up and running with our library in minutes.</p>
      
      <h3 id="quick-start-hello-world">Hello World Example</h3>
      <p>Here's a simple example to get you started:</p>
      <pre><code>const ourPackage = require('our-package');

// Initialize with your API key
const client = new ourPackage.Client('YOUR_API_KEY');

// Make your first request
client.sendRequest('Hello, World!')
  .then(response => {
    console.log('Response:', response);
  })
  .catch(error => {
    console.error('Error:', error);
  });</code></pre>
      
      <h3 id="quick-start-basic-concepts">Basic Concepts</h3>
      <p>Before diving deeper, it's important to understand these core concepts:</p>
      <ul>
        <li><strong>Client</strong>: The main entry point for the API</li>
        <li><strong>Requests</strong>: How you communicate with our services</li>
        <li><strong>Callbacks</strong>: How you handle responses</li>
        <li><strong>Error handling</strong>: How to deal with problems</li>
      </ul>
    </div>
  `,
  
  'core-api': `
    <h1 class="doc-title">Core API</h1>
    <div class="doc-content">
      <p>Documentation for the core functionality of our API.</p>
      
      <h3 id="core-api-authentication">Authentication</h3>
      <p>All API requests require authentication using API keys. Here's how to authenticate:</p>
      <pre><code>const client = new ourPackage.Client({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // or 'sandbox' for testing
});</code></pre>
      <p>Keep your API keys secure and never expose them in client-side code.</p>
      
      <h3 id="core-api-requests">Requests & Responses</h3>
      <p>The basic request structure follows this pattern:</p>
      <pre><code>client.resource.action(parameters)
  .then(response => {
    // Handle successful response
  })
  .catch(error => {
    // Handle error
  });</code></pre>
      <p>For example, to get a user by ID:</p>
      <pre><code>client.users.get({ id: 'user_123' })
  .then(user => {
    console.log(user.name);
  });</code></pre>
      
      <h3 id="core-api-errors">Error Handling</h3>
      <p>Our API returns standard error objects with the following structure:</p>
      <pre><code>{
  "code": "error_code",
  "message": "Human-readable error message",
  "details": { /* Additional error details */ }
}</code></pre>
      <p>Common error codes include:</p>
      <ul>
        <li><code>authentication_error</code>: Invalid API key</li>
        <li><code>validation_error</code>: Invalid request parameters</li>
        <li><code>not_found</code>: Requested resource not found</li>
        <li><code>rate_limited</code>: Too many requests</li>
      </ul>
    </div>
  `,
  
  'advanced-api': `
    <h1 class="doc-title">Advanced API</h1>
    <div class="doc-content">
      <p>Advanced features for power users.</p>
      
      <h3 id="advanced-api-batching">Request Batching</h3>
      <p>For efficiency, you can batch multiple operations into a single API request:</p>
      <pre><code>const batch = client.createBatch();

batch.add(client.users.get({ id: 'user_1' }));
batch.add(client.users.get({ id: 'user_2' }));
batch.add(client.products.list({ category: 'books' }));

batch.execute()
  .then(results => {
    // results[0] = user_1 data
    // results[1] = user_2 data
    // results[2] = products list
  });</code></pre>
      
      <h3 id="advanced-api-webhooks">Webhooks</h3>
      <p>Set up webhooks to receive real-time updates:</p>
      <pre><code>client.webhooks.create({
  url: 'https://your-server.com/webhook',
  events: ['user.created', 'user.updated'],
  secret: 'your_webhook_secret'
});</code></pre>
      <p>Always verify webhook signatures:</p>
      <pre><code>const isValid = client.webhooks.verifySignature(
  requestBody,
  signatureHeader,
  'your_webhook_secret'
);</code></pre>
    </div>
  `,
  
  'beginner-tutorials': `
    <h1 class="doc-title">Beginner Tutorials</h1>
    <div class="doc-content">
      <p>Step-by-step guides for beginners.</p>
      
      <h3 id="beginner-first-app">Building Your First App</h3>
      <p>This tutorial walks you through creating a complete application:</p>
      <ol>
        <li>Setting up your development environment</li>
        <li>Installing the necessary packages</li>
        <li>Creating your first project</li>
        <li>Implementing basic features</li>
        <li>Testing your application</li>
      </ol>
      <p>Sample code for a minimal app:</p>
      <pre><code>const express = require('express');
const ourPackage = require('our-package');

const app = express();
const client = new ourPackage.Client('YOUR_API_KEY');

app.get('/api/data', async (req, res) => {
  try {
    const data = await client.data.get();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});</code></pre>
      
      <h3 id="beginner-auth">Authentication Tutorial</h3>
      <p>Learn how to implement user authentication:</p>
      <pre><code>// User signup
app.post('/signup', async (req, res) => {
  try {
    const user = await client.users.create({
      email: req.body.email,
      password: req.body.password
    });
    res.json({ userId: user.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const token = await client.auth.login({
      email: req.body.email,
      password: req.body.password
    });
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});</code></pre>
    </div>
  `,
  
  'advanced-tutorials': `
    <h1 class="doc-title">Advanced Tutorials</h1>
    <div class="doc-content">
      <p>In-depth guides for experienced developers.</p>
      
      <h3 id="advanced-custom-integrations">Custom Integrations</h3>
      <p>Learn how to build custom integrations with third-party services:</p>
      <pre><code>// Example: Integrating with a payment processor}</code></pre>
      
      <h3 id="advanced-scaling">Scaling Your Application</h3>
      <p>Best practices for scaling your application:</p>
      <ul>
        <li>Implement caching for frequently accessed data</li>
        <li>Use connection pooling for database connections</li>
        <li>Set up proper error handling and retry logic</li>
        <li>Implement rate limiting and circuit breakers</li>
      </ul>
      <pre><code>// Example: Implementing a cache layer
const Redis = require('ioredis');
const redis = new Redis();

async function getCachedData(key, fetchFn, ttl = 3600) {
  // Try to get from cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // If not in cache, fetch fresh data
  const data = await fetchFn();
  
  // Store in cache for future requests
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
  
  return data;
}

// Usage
app.get('/api/products', async (req, res) => {
  try {
    const products = await getCachedData(
      'products_list',
      () => client.products.list(),
      1800 // 30 minutes cache
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});</code></pre>
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

  if(user.moduleTimes[index] < Date.now() || !user){
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
