const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { dbURI } = require('./config/database');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const documentationRoutes = require('./routes/documentation');

const app = express();

const corsOptions = {
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

mongoose.connect(dbURI)
    .then(() => console.log("Database connected"))
    .catch(err => console.log("Database connection error", err));

app.use('/api/auth', authRoutes);
app.use('/api', shopRoutes);
app.use('/api/documentation', documentationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
