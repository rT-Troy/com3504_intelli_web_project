const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the Message model
const MessageSchema = new Schema({
    plantId: { type: Schema.Types.ObjectId, ref: 'PlantSighting', required: true }, // Reference to the PlantSighting model
    text: { type: String, required: true },
    nickname: { type: String, required: true }
});

// Create the mongoose model 'Comment' based on the defined schema
const Message = mongoose.model('Message', MessageSchema);

// Export the Comment model for use in other modules
module.exports = Message;
