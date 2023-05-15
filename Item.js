const mongoose = require('mongoose');
const User = require('./User');

// Define the user schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Float32Array,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    imagepath: {
        type: String,
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

// Create the User model
const Item = mongoose.model('Item', itemSchema);

// Export the User model
module.exports = Item;