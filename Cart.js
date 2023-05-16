const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    count: {
        type: Number,
        default: 1
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
