const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    image: { type: String, required: true } 
});

const aboutSchema = new mongoose.Schema({
    team: [teamMemberSchema]
});


const About = mongoose.model('About', aboutSchema);

module.exports = About;
