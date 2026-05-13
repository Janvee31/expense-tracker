const express = require("express");
const cors = require("cors");
require("dotenv").config();
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/ai", aiRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
    console.log(`AI Microservice is running on http://localhost:${PORT}`);
});
