const mongoose = require('mongoose');

// Define the schema
const transactionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the model based on the schema
module.exports = mongoose.model('Transaction', transactionSchema);