const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    name: String,
    phone: String, 
    email: String,
    message: String
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;