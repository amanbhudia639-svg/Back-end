require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = process.env.MONGO_URI;

// Create a new MongoClient
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

connectDB();






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

