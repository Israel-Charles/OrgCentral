// /backend/server.js

const express = require("express");
const connectDB = require("./config/db.js");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Connect to the database
connectDB();

// Allow app to use/parse JSON
app.use(express.json({ limit: "100kb" }));

// Routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("APP is running...");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
