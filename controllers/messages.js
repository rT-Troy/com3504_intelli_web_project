// Import the messages model
const messageModel = require('../models/messages');

// Function to create a new comment
exports.create = function (formData) {
    // Create a new comment instance using the provided data
    let message = new messageModel({
        text: formData.text,
        user: formData.user,
        plantSighting: formData.plantSighting
    });

    // Save the comment to the database and handle success or failure
    return message.save().then(savedMessage => {
        // Log the created comment
        console.log(savedMessage);

        // Return the comment data as a JSON string
        return JSON.stringify(savedMessage);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

// Function to retrieve all comments
exports.getAllForPlant = function (plantId) {
    return messageModel.find({ plantSighting: plantId }).then(messages => {
        return messages;
    }).catch(err => {
        console.log(err);
        return null;
    });
};