const { Double } = require('mongodb');
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now()
  },
  updatedAt: {
    type: Date,
    default: () => Date.now()
  },
  balance: {
    type: Number,
    min: 0,
    max: 9999.99
  },
  type: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;