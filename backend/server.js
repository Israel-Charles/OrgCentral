// backend/server.js
const express = require('express');
const connectDB = require('./config/db.js');            // Import the database connection function
const dotenv = require('dotenv');                       // Import the environment variable to be used by the other parts of the app

// Load environment variables
dotenv.config();

const app = express();

// Connect to the database
connectDB();

app.get('/', (req, res) =>{
    res.send('APP is running...');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});