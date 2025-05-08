const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    message: String,
    status: { type: String, default: 'pending' }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;