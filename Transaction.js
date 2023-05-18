const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    cost: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    submission_date: {
        type: Date,
        default: Date.now
    },
    delivery_date: {
        type: Date,
        default: function () {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 3);
            return currentDate;
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;