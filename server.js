require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
// Enable CORS so Vue can talk to Express
app.use(cors());
app.use(express.json());
const uri = process.env.MONGO_URI;

// Enable CORS so Vue can talk to Express
app.use(cors());
app.use(express.json());

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
const db = client.db("ProductList");
const collection = db.collection("products");
const orders = db.collection("ORDERS");


app.get('/lessons', async (req, res) => {
  try {

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

app.post('/Order', async (req, res) => {
  const { Name, phone, productid, pname, quantity} = req.body;

  const namePattern = /^[A-Za-z\s]+$/;
  if (!namePattern.test(Name)) {
    return res.status(400).json({ error: "Please enter letters." });
  }
  
  const PhonePattern = /^[0-9]+$/;
  if (!PhonePattern.test(phone)) {
    return res.status(400).json({ error: "Please enter numbers." });
  }
  
  try {

    const userinput = { Name, phone, productid, pname, quantity };
    await orders.insertOne(userinput);

    res.status(201).json({ message: "Order successfully placed!"});
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Error" });
    
  }

});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

