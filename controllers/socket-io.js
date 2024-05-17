const Message = require('../models/messages');

exports.init = function(io) {
    io.sockets.on('connection', async function(socket) {
        console.log("try");
        try {
            /**
             * create or joins a room
             */
            socket.on('create or join', async function(room, userId) {
                socket.join(room);
                io.sockets.to(room).emit('joined', room, userId);

                // Retrieve existing messages for the plant sighting from the database
                try {
                    const messages = await Message.find({ plantSighting: room }).sort({ createdAt: 1 });
                    // Emit existing messages to the client to display as chat messages
                    messages.forEach(message => {
                        socket.emit('sendChatMessage', room, message.user, message.text, message.createdAt);
                    });
                } catch (err) {
                    console.error('Error retrieving existing messages:', err);
                }
            });

            // Handle the 'sendChatMessage' event from the client
            socket.on('sendChatMessage', async function(roomNo, userId, chatText, createdAt) {
                // Send the message to the chat
                io.sockets.to(roomNo).emit('sendChatMessage', roomNo, userId, chatText, createdAt);

                // Create a new message instance using the provided data
                let message = new Message({
                    text: chatText,
                    user: userId,
                    plantSighting: roomNo
                });

                // Save the message to the database
                try {
                    const savedMessage = await message.save();
                    // Optionally, you can emit an event back to the client to confirm that the message was saved
                    // socket.emit('chatMessageSaved', savedMessage);
                } catch (err) {
                    // Handle any errors that occur during message saving
                    console.error('Error saving message:', err);
                }
            });

            socket.on('disconnect', function(){
                console.log('someone disconnected');
            });
        } catch (e) {
            console.error('Error:', e);
        }
    });
}
