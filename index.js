const express = require("express");
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const uri = "mongodb+srv://Ahmed200k:Aeuzilua7mDbKK2q@parallelanddistributed.ukthwyn.mongodb.net/Parallel_Project";
const User = require('./User');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const Item = require('./Item');
const Cart = require('./Cart');
const Transaction = require("./Transaction");
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
var itembeingedited;

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
  if (CurrentUser !== undefined && CurrentUser.type === 'Seller') res.redirect('/');
  const items = await Item.find({ category: 'electronics' });
  res.render('shop', { user: CurrentUser, items: items });
});
app.get('/clothing', async (req, res) => {
  if (CurrentUser !== undefined && CurrentUser.type === 'Seller') res.redirect('/');
  const items = await Item.find({ category: 'clothing' });
  res.render('shop', { user: CurrentUser, items: items });
});
app.get('/shop', async (req, res) => {
  if (CurrentUser !== undefined && CurrentUser.type === 'Seller') res.redirect('/');
  const items = await Item.find({});
  res.render('shop', { user: CurrentUser, items: items });
});
app.get('/home', async (req, res) => {
  if (CurrentUser !== undefined && CurrentUser.type === 'Seller') res.redirect('/');
  const items = await Item.find({ category: 'home' });
  res.render('shop', { user: CurrentUser, items: items });
});
app.get('/book', async (req, res) => {
  if (CurrentUser !== undefined && CurrentUser.type === 'Seller') res.redirect('/');
  const items = await Item.find({ category: 'books' });
  res.render('shop', { user: CurrentUser, items: items });
});
app.get('/cart', async (req, res) => {
  if (CurrentUser === undefined || CurrentUser.type === 'Seller') {
    res.redirect('/');
  } else {
    const cartitems = [];
    const noofitems = [];
    const cart = await Cart.find({ user: CurrentUser._id });
    await Promise.all(cart.map(async (cartItem) => {
      const item = await Item.findById(cartItem.item);
      if (item) {
        cartitems.push(item);
        noofitems.push(cartItem.count);
      }
    }));
    res.render('cart', { user: CurrentUser, items: cartitems, noofitems: noofitems });
  }
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
app.get('/admin', async (req, res) => {
  if (CurrentUser === undefined || CurrentUser.type !== 'Admin') {
    res.redirect('/login');

  } else {
    const itemWithHighestCount = await Item.findOne()
      .sort({ count: -1 })  // Sort by count in descending order
      .limit(1);  // Retrieve only one item with the highest count

    const itemWithHighestCountelec = await Item.findOne({ category: "electronic" })
      .sort({ count: -1 })  // Sort by count in descending order
      .limit(1);  // Retrieve only one item with the highest count
    const itemWithHighestCounthome = await Item.findOne({ category: "home" })
      .sort({ count: -1 })  // Sort by count in descending order
      .limit(1);  // Retrieve only one item with the highest count
    const itemWithHighestCountbook = await Item.findOne({ category: "book" })
      .sort({ count: -1 })  // Sort by count in descending order
      .limit(1);  // Retrieve only one item with the highest count
    const itemWithHighestCountcloth = await Item.findOne({ category: "clothing" })
      .sort({ count: -1 })  // Sort by count in descending order
      .limit(1);  // Retrieve only one item with the highest count

    const transaction = await Transaction.findOne()
      .sort({ cost: -1 })  // Sort by count in descending order
      .limit(1);  // Retrieve only one item with the highest count

    highestcustomer = await User.findById({ _id: transaction.user });
    res.render('admin', { user: CurrentUser, mostsold: itemWithHighestCount, BestTransaction: transaction, highestcustomer, itemWithHighestCountelec, itemWithHighestCounthome, itemWithHighestCountbook, itemWithHighestCountcloth });
  }
});

app.get('/seller', (req, res) => {
  if (CurrentUser === undefined || CurrentUser.type === 'Customer') {
    res.redirect('/login');
  }
  else res.render('seller', { user: CurrentUser });
});
app.get('/editprofile', (req, res) => {
  if (CurrentUser === undefined) {
    res.redirect('/login');
  }
  else res.render('editprofile', { user: CurrentUser });
});
app.get('/edititem', (req, res) => {
  if (CurrentUser === undefined) {
    res.redirect('/login');
  }
  else res.render('edititem', { user: CurrentUser });
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
app.get("/myitems", async (req, res) => {
  if (CurrentUser === undefined) {
    res.redirect('/');
  } else {
    const items = await Item.find({ seller: CurrentUser._id });
    res.render("myitems", { user: CurrentUser, items: items })
  }
});

app.get("/adminlogin", (req, res) => {
  res.render("adminlogin", { pageTitle: "Adminlogin" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// POSTS
app.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password, phone, type, address } = req.body;

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
    address,
    salt,
  });

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already exists",
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
      return res.render("login", {
        error: "User doesn't Exist",
      });
    }

    // Compare the provided password with the stored hashed password
    const hash = crypto
      .createHash("sha256")
      .update(password + user.salt)
      .digest("hex");
    if (hash !== user.password) {
      return res.render("login", {
        error: "Wrong Password",
      });
    }
    // Passwords match, user is authenticated
    CurrentUser = user;
    res.redirect("/");
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect('/');
  }
});

app.post("/adminlogin", async (req, res) => {
  const { email, token } = req.body;

  try {
    // Find the user in the database based on the email
    const user = await User.findOne({ email });
    // If the user does not exist, return an error
    if (!user) {
      return res.render("adminlogin", {
        error: "Email doesn't exists",
      });
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
      return res.render("adminlogin", {
        error: "Wrong Token",
      });
    }
    user.type = "Admin";
    await user.save();
    res.redirect('/login')
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect('/');
  }
});

// Route for handling the "Forgot Password" form submission
app.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.render("forgotpassword", {
      error: "Email doesn't exists",
    });
  }
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
  res.redirect('/');
});

app.post("/additem", upload.single('itemimage'), async (req, res) => {
  try {
    const imagePath = 'uploads/' + req.file.filename;
    const { itemname, itemprice, itemdescription, itemcategory, itemquantity } = req.body;
    const newitem = new Item({
      name: itemname,
      price: itemprice,
      description: itemdescription,
      category: itemcategory,
      imagepath: imagePath,
      quantity: itemquantity,
      seller: CurrentUser
    });
    await newitem.save();
    res.redirect('/');
  } catch (error) {
    console.error("Error during Loading:", error);
    res.redirect('/');
  }
});
app.post("/shop", async (req, res) => {
  try {
    const { userid, itemid } = req.body;
    const user = await User.findOne({ _id: userid });
    const item = await Item.findOne({ _id: itemid });
    const cart = await Cart.findOne({ user: user._id, item: item._id })
    if (cart !== null) {
      if (cart.item.equals(item._id)) {
        cart.count += 1;
        await cart.save();
      }
    } else {
      const newcart = new Cart({
        user: user,
        item: item
      });
      await newcart.save();
    }
    res.redirect("/shop");
  } catch (error) {
    console.error("Error during loading:", error);
    res.redirect('/');
  }
});
app.post("/shopsearch", async (req, res) => {

  try {
    const { search, minPrice, maxPrice, category } = req.body;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice) {
      query.price = { $gte: minPrice };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: maxPrice };
    }

    if (category) {
      query.category = category;
    }
    const items = await Item.find(query);
    res.render('shop', { user: CurrentUser, items: items });
  } catch (error) {
    console.error("Error during loading:", error);
    res.redirect('/');
  }
});
app.post("/shoprm", async (req, res) => {
  try {
    const { userid, itemid } = req.body;
    const user = await User.findOne({ _id: userid });
    const item = await Item.findOne({ _id: itemid });
    const cart = await Cart.findOneAndRemove({ user: CurrentUser._id, item: itemid });
    res.redirect(req.headers.referer);
  } catch (error) {
    console.error("Error during loading:", error);
    res.redirect('/');
  }
});
app.post("/edititem", async (req, res) => {
  try {
    const { userid, itemid } = req.body;
    const user = await User.findOne({ _id: userid });
    const item = await Item.findById({ _id: itemid });
    itembeingedited = item;
    res.render("edititem", { user: user, item: item });
  } catch (error) {
    console.error("Error during loading:", error);
    res.redirect('/');
  }
});
app.post("/deleteitem", async (req, res) => {
  try {
    const { itemid } = req.body;
    const item = await Item.findByIdAndDelete({ _id: itemid });
    res.redirect('/shop');
  } catch (error) {
    res.redirect('/');
  }
});

app.post("/edittheitem", upload.single('itemimage'), async (req, res) => {
  try {
    if (itembeingedited === undefined) {
      return res.redirect('/edititem');
    }
    const { itemname, itemprice, itemdescription, itemcategory, itemquantity } = req.body;
    const item = itembeingedited;
    itembeingedited = undefined;
    if (req.file !== undefined) {
      fs.unlink(item.imagepath, function (err) {
      });
      const imagePath = 'uploads/' + req.file.filename;
      item.imagepath = imagePath;
    }
    item.name = itemname;
    item.price = itemprice;
    item.description = itemdescription;
    item.category = itemcategory;
    item.quantity = itemquantity;
    await item.save();
    res.redirect('/myitems');
  } catch (error) {
    console.error("Error during Loading:", error);
    res.redirect('/');
  }
});
app.post("/editprofile", async (req, res) => {
  const { first_name, last_name, email, password, phone, type } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && CurrentUser.email != email) {
      return res.render("editprofile", {
        error: "Email already exists",
        user: CurrentUser,
      });
    }
    const hash = crypto
      .createHash("sha256")
      .update(password + CurrentUser.salt)
      .digest("hex");

    if (hash !== CurrentUser.password) {
      return res.render("editprofile", {
        error: "Wrong Password",
        user: CurrentUser,
      });
    }
    CurrentUser.email = email;
    CurrentUser.first_name = first_name;
    CurrentUser.last_name = last_name;
    CurrentUser.phone = phone;
    CurrentUser.type = type;
    await CurrentUser.save();
    res.redirect('/');
  } catch (error) {
    console.error("Error during signup:", error);
    res.redirect('/');
  }
});
app.post('/checkout', async (req, res) => {
  try {
    var totalprice = 0;
    var description = "";
    const cartitems = [];
    const noofitems = [];
    const cart = await Cart.find({ user: CurrentUser._id });
    await Promise.all(cart.map(async (cartItem) => {
      const item = await Item.findById(cartItem.item);
      if (item) {
        cartitems.push(item);
        noofitems.push(cartItem.count);
      }
    }));
    for (let i = 0; i < cartitems.length; i++) {
      totalprice += cartitems[i].price * noofitems[i];
      description += "Item: " + cartitems[i].name + " Price: " + cartitems[i].price + "Quantity" + noofitems[i] + " ";
      cartitems[i].count += noofitems[i];
      cartitems[i].quantity -= noofitems[i];
      if (noofitems[i].quantity === 0) {
        noofitems[i].sold = true;
      }
      await cartitems[i].save();
    }
    if (description === "") {
      await Cart.deleteMany({ user: CurrentUser._id });
      return res.redirect('/');
    }
    await Cart.deleteMany({ user: CurrentUser._id });
    const newpayment = new Transaction({
      cost: totalprice,
      description: description,
      user: CurrentUser,
    });
    newpayment.save();
    res.redirect('/');
  } catch (err) {
    res.redirect('/');
  }
});
app.post('/itempreview', async (req, res) => {
  try {
    const { itemid } = req.body;
    const item = await Item.findById({ _id: itemid });
    res.render('itempreview', { user: CurrentUser, item });
  } catch (err) {
    res.redirect('/');
  }
});