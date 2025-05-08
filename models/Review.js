const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    status: { type: String, default: 'pending' }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;