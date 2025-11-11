require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
// Enable CORS so Vue can talk to Express
app.use(cors());
app.use(express.json());
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


app.get('/lessons', async (req, res) => {
  try {
    const db = client.db("ProductList");
    const collection = db.collection("products");

    const products = await collection.find({}).toArray();

    if (products.length === 0) {
      res.status(404).json({ message: "No products found" });
    } else {
      res.json(products);
    }

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error" });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

