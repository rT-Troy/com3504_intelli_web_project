const mongoose = require('mongoose');

// Define the MongoDB connection URL, including
// the database name ('posts' in this case)
const mongoDB = 'mongodb://localhost:27017/messages';
let connection;

// Set Mongoose to use the global Promise library
mongoose.Promise = global.Promise;

// Connect to the MongoDB server
mongoose.connect(mongoDB).then(result => {
    // Store the connection instance for later use if needed
    connection = result.connection;
    // Log a success message if the connection is established
    console.log("Connection Successful!");
}).catch(err => {
    // Log an error message if the connection fails
    console.log("Connection Failed!", err);
});

