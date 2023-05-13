const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const uri = "mongodb+srv://Ahmed200k:Aeuzilua7mDbKK2q@parallelanddistributed.ukthwyn.mongodb.net/Parallel_Project";
const User = require('./User');
const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Start using Mongoose here
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use(bodyParser.urlencoded({ extended: true }));
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
app.post('/signup', (req, res) => {
  const { first_name, last_name, email, password, type } = req.body;

  // Create a new user document
  const hash = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');

  const newUser = new User({
    first_name,
    last_name,
    email,
    password: hash,
    type,
    salt,
  });

  // Save the user document to the database
  newUser.save()
    .then(() => {
      console.log('User saved successfully');
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error('Error saving user:', error);
      res.sendStatus(500);
    });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database based on the email
    const user = await User.findOne({ email });
    console.log(user);
    // If the user does not exist, return an error
    if (!user) {
      return res.status(400).json({ error: 'User doesnot exist' });
    }

    // Compare the provided password with the stored hashed password
    const hash = crypto
      .createHash('sha256')
      .update(password + user.salt)
      .digest('hex');
    console.log(hash);
    console.log(user.password);
    if (hash !== user.password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }


    // Passwords match, user is authenticated
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
