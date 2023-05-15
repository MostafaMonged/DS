const express = require("express");
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const uri = "mongodb+srv://Ahmed200k:Aeuzilua7mDbKK2q@parallelanddistributed.ukthwyn.mongodb.net/Parallel_Project";
const User = require('./User');
const crypto = require('crypto');
const multer = require('multer');
const Item = require('./Item');
const salt = crypto.randomBytes(16).toString('hex');


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// Connect to MongoDB
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Start using Mongoose here
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    // Generate a unique filename by adding a timestamp
    const timestamp = Date.now();
    const extension = file.originalname.split('.').pop();
    cb(null, `${timestamp}.${extension}`);
  }
})

const upload = multer({ storage: storage })

app.use(bodyParser.urlencoded({ extended: true }));
app.engine("ejs", require("express-ejs-extend")); // add this line
app.engine("ejs", ejs.renderFile);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

var CurrentUser;
var userresetpassword;

app.get("/", async (req, res) => {
  res.render("home", { user: CurrentUser });
});
app.get("/signup", (req, res) => {
  if (CurrentUser != undefined) {
    res.redirect('/');
  } else res.render("signup", { pageTitle: "SignUp" });
});
app.get('/login', (req, res) => {
  res.render('login', { user: CurrentUser });
});
app.get('/electronic', async (req, res) => {
  if (CurrentUser == undefined) {
    res.redirect('/login');
  } else {
    const items = await Item.find({ category: 'electronics' });
    res.render('shop', { user: CurrentUser, items: items });
  }
});
app.get('/clothing', async (req, res) => {
  if (CurrentUser == undefined) {
    res.redirect('/login');
  } else {
    const items = await Item.find({ category: 'clothing' });
    res.render('shop', { user: CurrentUser, items: items });
  }
});
app.get('/shop', async (req, res) => {
  if (CurrentUser == undefined) {
    res.redirect('/login');
  } else {
    const items = await Item.find({});
    res.render('shop', { user: CurrentUser, items: items });
  }
});
app.get('/cart', (req, res) => {
  console.log(CurrentUser.type);
  if (CurrentUser === undefined || CurrentUser.type === 'Seller') {
    res.redirect('/');
  } else res.render('cart', { user: CurrentUser });
});
app.get('/checkout', (req, res) => {
  if (CurrentUser === undefined || CurrentUser.type === 'Seller') {
    res.redirect('/');
  } else res.render('checkout', { user: CurrentUser });
});
app.get('/profile', (req, res) => {
  if (CurrentUser === undefined) {
    res.redirect('/login');
  } else res.render('profile', { user: CurrentUser });
});
app.get('/itempreview', (req, res) => {
  if (CurrentUser == undefined) {
    res.redirect('/');
  } else res.render('itempreview', { user: CurrentUser });
});

app.get('/admin', (req, res) => {
  if (CurrentUser == undefined || CurrentUser.type !== 'Admin') {
    res.redirect('/login');
  } else res.render('admin', { user: CurrentUser });
});

app.get('/seller', (req, res) => {
  if (CurrentUser == undefined || CurrentUser.type === 'Customer') {
    res.redirect('/login');
  }
  else res.render('seller', { user: CurrentUser });
});

app.get('/signout', (req, res) => {
  CurrentUser = undefined;
  res.redirect('/');
});

app.get("/forgotpassword", (req, res) => {
  if (CurrentUser != undefined) {
    res.redirect('/');
  } else res.render("forgotpassword", { pageTitle: "Forgotpassword" });
});

app.get("/adminlogin", (req, res) => {
  res.render("adminlogin", { pageTitle: "Adminlogin" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
// POSTS
app.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password, phone, type } = req.body;

  // Create a new user document
  const hash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");

  const newUser = new User({
    first_name,
    last_name,
    email,
    password: hash,
    phone,
    type,
    salt,
  });

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already exists",
        existingUser: User,
      });
    }
    await newUser.save();
    CurrentUser = newUser;
    res.redirect('/');
  } catch (error) {
    console.error("Error during signup:", error);
    res.redirect('/');
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database based on the email
    const user = await User.findOne({ email });
    // If the user does not exist, return an error
    if (!user) {
      return res.redirect('/');
    }

    // Compare the provided password with the stored hashed password
    const hash = crypto
      .createHash("sha256")
      .update(password + user.salt)
      .digest("hex");
    console.log(hash);
    console.log(user.password);
    if (hash !== user.password) {
      return res.status(400).json({ error: "Wrong Password" });
    }
    // Passwords match, user is authenticated
    CurrentUser = user;
    res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect('/');;
  }
});

app.post("/adminlogin", async (req, res) => {
  const { email, token } = req.body;

  try {
    // Find the user in the database based on the email
    const user = await User.findOne({ email });
    // If the user does not exist, return an error
    if (!user) {
      return res.redirect('/login');
    }

    // Compare the provided password with the stored hashed password
    const hash = crypto
      .createHash("sha256")
      .update(token + 'abbbcasdqwe1231254')
      .digest("hex");

    const tokenequal = crypto
      .createHash("sha256")
      .update(12355 + 'abbbcasdqwe1231254')
      .digest("hex");
    if (hash !== tokenequal) {
      return res.redirect('/login');;
    }
    user.type = "Admin";
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect('/');;
  }
});

// Route for handling the "Forgot Password" form submission
app.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  userresetpassword = user;
  res.render('newpassword');
});

app.post("/newpassword", async (req, res) => {
  const { password } = req.body;
  user = userresetpassword;
  userresetpassword = undefined;
  const hash = crypto
    .createHash("sha256")
    .update(password + user.salt)
    .digest("hex");
  user.password = hash;
  await user.save();

  // Provide feedback to the user that their password has been reset
  res.redirect('/');
});
app.post("/additem", upload.single('itemimage'), async (req, res) => {
  const imagePath = 'uploads/' + req.file.filename;
  const { itemname, itemprice, itemdescription, itemcategory } = req.body;
  const newitem = new Item({
    name: itemname,
    price: itemprice,
    description: itemdescription,
    category: itemcategory,
    imagepath: imagePath,
    seller: CurrentUser
  });
  await newitem.save();
  res.redirect('/');
});
