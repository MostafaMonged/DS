const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const uri = "mongodb+srv://Ahmed200k:Aeuzilua7mDbKK2q@parallelanddistributed.ukthwyn.mongodb.net/Parallel_Project";
const User = require('./database/User');
const Product = require('./database/Product');
const crypto = require('crypto');
const salt = crypto.randomBytes(16).toString('hex');

// This function is for testing purposes, it will be deleted later.
run()
async function run() {
  const user = await User.find();
  console.log(user)
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
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

var CurrentUser;

app.get('/', (req, res) => {
  res.render('home', { user: CurrentUser });
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
app.get('/profile', (req, res) => {
  res.render('profile', { pageTitle: 'Profile' });
});
app.get('/itempreview', (req, res) => {
  res.render('itempreview', { pageTitle: 'Itempreview' });
});
app.get('/admin', (req, res) => {
  res.render('admin', { pageTitle: 'Admin' });
});
app.get('/seller', (req, res) => {
  res.render('seller', { pageTitle: 'Seller' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
// POSTS
app.post('/signup', async (req, res) => {
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

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'Email already exists', existingUser: User });
    }
    await newUser.save();
    CurrentUser = newUser;
    res.render('home', { user: CurrentUser });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Server error' });
  }

});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;


  try {
    // Find the user in the database based on the email
    const user = await User.findOne({ email });
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
      return res.status(400).json({ error: 'Wrong Password' });
    }
    // Passwords match, user is authenticated
    CurrentUser = user;
    res.render('home', { user })
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Temporary storage for password reset tokens
const passwordResetTokens = new Map();

// Route for handling the "Forgot Password" form submission
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Validate the email address (you can use a library like 'validator' for more robust email validation)

  const user = await User.findOne({ email });

  // Generate a secure token for password reset
  const token = crypto.randomBytes(20).toString('hex');

  // Store the token along with the user's email address and a timestamp
  passwordResetTokens.set(email, { token, timestamp: Date.now() });

  res.send(`Password reset token: ${token}`);
});

app.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;

  // Retrieve the stored token and timestamp for the email
  const storedToken = passwordResetTokens.get(email);

  if (storedToken && storedToken.token === token) {
    // Check if the token is still valid (e.g., not expired, within a specific time limit)
    const timestampDiff = Date.now() - storedToken.timestamp;
    const tokenExpirationTime = 60 * 60 * 1000; // 1 hour

    if (timestampDiff <= tokenExpirationTime) {
      const hash = crypto
        .createHash('sha256')
        .update(password + salt)
        .digest('hex');
      user.password = hash;
      user.salt = salt;
      passwordResetTokens.delete(email);

      // Provide feedback to the user that their password has been reset
      res.send('Password reset successful!');
    } else {
      // Token has expired
      res.status(400).send('Password reset token has expired.');
    }
  } else {
    // Invalid token or email
    res.status(400).send('Invalid password reset token or email.');
  }
});

app.post('/delete-account', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.render('delete-account', { error: 'User not found' });
    }
    await existingUser.delete();
  } catch (error) {
    console.error('Error during deleting account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/update-email', async (req, res) => {

});

app.post('/update-password', async (req, res) => {

});
