const express = require('express');
const app = express();
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const expressLayouts = require('express-ejs-layouts');
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = "mongodb+srv://Ahmed200k:Aeuzilua7mDbKK2q@parallelanddistributed.ukthwyn.mongodb.net/?retryWrites=true&w=majority";
const signupuser = require('./signup.js');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
app.use(express.json());
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.engine('ejs', require('express-ejs-extend')); // add this line
app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('home', { pageTitle: 'Home' });
});
app.get('/signup', (req, res) => {
    res.render('signup', { pageTitle: 'SignUp' });
});
app.get('/login', (req, res) => {
    res.render('login', { pageTitle: 'Login' });
});
app.get('/shop', (req, res) => {
    res.render('shop', { pageTitle: 'Shop' });
});
app.get('/cart', (req, res) => {
    res.render('cart', { pageTitle: 'Cart' });
});
app.get('/checkout', (req, res) => {
    res.render('checkout', { pageTitle: 'Checkout' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
// POSTS
app.post('/signup', async (req, res) => {
    try {
      // Get user data from the request body
      const { first_name, last_name, email, password, confirm_password, type } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user object with the hashed password
      const user = {
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
        type,
      };
  
      // Connect to MongoDB
      const client = await MongoClient.connect(url);
      const db = client.db(Parallel_Project);
  
      // Insert the new user into the database
      const result = await db.collection('Users').insertOne(user);
  
      // Close the database connection
      client.close();
  
      res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
});