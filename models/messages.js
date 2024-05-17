let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let messageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    user: { type: String, required: true }, // Reference to user who posted the comment
    createdAt: { type: Date, default: Date.now },
    plantSighting: { type: String, required: true }
})

let Message = mongoose.model('Message', messageSchema);

module.exports = Message;