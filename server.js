require('dotenv').config(); // Load variables from the .env file
const express = require('express'); // Imports Express framework
const cors = require('cors'); // Imports CORS middleware
const { MongoClient } = require('mongodb'); // Imports mongoDB client 

const app = express(); // Creates an exppress app 

app.use(cors()); // Enable CORS so Vue can talk to Express
app.use(express.json()); // Allows Express to work with json request

// LOGGING middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}`); // Log timestamp
  console.log(`${req.method}${req.originalUrl}`); // Log HTTP method + URL
  console.log();
  next(); // Continues request
});

// NO need to add a static middleware file as my frontend dose not contain any images and only uses icons 

const uri = process.env.MONGO_URI; // Loads MongoDB connection from enviroment 

const client = new MongoClient(uri); // Create a new MongoClient

// connect to MongoDB
async function connectDB() {
  try {
    await client.connect(); // attempts conection 
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectDB();
const db = client.db("ProductList"); // Select database
const collection = db.collection("products"); // Select products collection inside the productlist database
const orders = db.collection("ORDERS"); // Select ORDERS collection inside the productlist database

//route is used to fetch all the products
app.get('/lessons', async (req, res) => {
  try {

    const products = await collection.find({}).toArray(); // Retrieves all products

    if (products.length === 0) {
      res.status(404).json({ message: "No products found" }); // no products found 
    } else {
      res.json(products); // Returns product list 
    }

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error" }); // if database fails
  }
});

//route is used to post the order to the database (ORDERS collection)
app.post('/Order', async (req, res) => {
  const { Name, phone, productid, pname, quantity, total} = req.body;

  //Validates the names (only letters and spaces)
  const namePattern = /^[A-Za-z\s]+$/;
  if (!namePattern.test(Name)) {
    return res.status(400).json({ error: "Please enter letters." });
  }
  
  //Validates the phone (only numbers)
  const PhonePattern = /^[0-9]+$/;
  if (!PhonePattern.test(phone)) {
    return res.status(400).json({ error: "Please enter numbers." });
  }
  
  try {

    const userinput = { Name, phone, productid, pname, quantity, total};
    await orders.insertOne(userinput); // Inserts the order into the database 

    res.status(201).json({ message: "Order successfully placed!"});
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Error" });
    
  }

});

// route that searchs for the products
app.get('/lessons/search', async (req, res) => {
    const { query } = req.query; //Get the search query from url 

    if (!query) {
        return res.status(400).json({ message: "Query is required for searching." });
    }

    const numericQuery = Number(query); // converts query to number
    const isNumeric = !isNaN(numericQuery); // checks if the value is not a number 

    try {

        const Conditions = []; // array conating search conditions

        Conditions.push({ pname: { $regex: query, $options: 'i' }}); // Search name of the product (case insensitive)
        Conditions.push({ location: { $regex: query, $options: 'i' }}); // Search location of the product (case insensitive)

        if (isNumeric) {
            Conditions.push({ price: numericQuery }); // search price
            Conditions.push({ quantity: numericQuery }); // search quantity
        }

        const products = await collection.find({$or: Conditions }).toArray();

        res.status(200).json({ products });// returns matching products
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "An error occurred while fetching users." });
    }
});

// route for adjusting quntity 
app.put('/quantity', async(req, res) =>{
  try{
    const { pname, quantity } = req.body; // Extracts fields from request body

    const change = await collection.updateOne(
      {pname: pname }, // Finds product by name
      {$set: {quantity: quantity}} // update quantity 
    );

    if(change.matchedCount === 0 ){
      return res.status(404).json({message: "Product not found"}); // no matching products
    }

    res.json({message: "Quantity updated", change}); // successful update
  }catch (error){
    console.error(error);
    res.status(500).json({message: "Server error"});
  }

});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // start 

