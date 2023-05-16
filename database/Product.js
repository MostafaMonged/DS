const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({

});

// Create the User model
const Product = mongoose.model('Product', productSchema);

// Export the User model
module.exports = Product;