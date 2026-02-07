const express = require('express');
const cors = require('cors');
const connectDB = require('./server/config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic test route
app.get('/', (req, res) => {
  res.send('Bookly API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});