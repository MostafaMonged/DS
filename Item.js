const mongoose = require('mongoose');
const User = require('./User');

// Define the user schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    imagepath: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sold: {
        type: Boolean,
        default: false
    }
});

// Create the User model
const Item = mongoose.model('Item', itemSchema);

// Export the User model
module.exports = Item;