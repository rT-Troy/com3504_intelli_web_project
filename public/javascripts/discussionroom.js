let name = null;
let roomNo = null;
let socket = io();


/**
 * called by <body onload>
 * it initialises the interface and the expected socket messages
 * plus the associated actions
 */
function init() {
    // it sets up the interface so that userId and room are selected
    document.getElementById('initial_form').style.display = 'block';
    document.getElementById('chat_interface').style.display = 'none';

    // called when someone joins the room. If it is someone else it notifies the joining of the room
    socket.on('joined', function (room, userId) {
        if (userId === name) {
            // it enters the chat
            hideLoginInterface(room, userId);
        } else {
            // notifies that someone has joined the room
            writeOnHistory('<b>'+userId+'</b>' + ' joined room ' + room);
        }
    });
    // called when a message is received
    socket.on('sendChatMessage', function (room, userId, chatText, createdAt) {
        let who = userId
        if (userId === name) who = 'Me';
        writeOnHistory('<b>' + who + ':</b> ' + chatText, new Date(createdAt));
    });

}

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
    roomNo = Math.round(Math.random() * 10000);
    document.getElementById('roomNo').value = 'R' + roomNo;
}

/**
 * called when the Send button is pressed. It gets the text to send from the interface
 * and sends the message via  socket
 */
function sendChatText() {
    let chatText = document.getElementById('text').value;
    document.getElementById('text').value = ''
    if (chatText != ''){
        let currentDate = new Date()
        socket.emit('sendChatMessage', roomNo, name, chatText, currentDate);
    }
}

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
function connectToRoom() {
    roomNo = document.getElementById('roomNo').value;
    name = document.getElementById('name').value;
    if (!name) name = 'Unknown-' + Math.random();
    socket.emit('create or join', roomNo, name);
}

/**
 * it appends the given html text to the history div
 * @param text: teh text to append
 */
function writeOnHistory(text, createdAt) {
    let history = document.getElementById('history');
    let messageDiv = document.createElement('div'); // Create a div element
    messageDiv.classList.add('message'); // Add a class for styling
    let options = { year: 'numeric', hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' };
    let formattedDate = createdAt.toLocaleString('en-UK', options);
    messageDiv.innerHTML = '<div>' + text + '</div><div class="date"><span class="timestamp">' + formattedDate + '</span></div>'; // Set the text content of the div
    history.appendChild(messageDiv); // Append the div to the history container

    let parentHeight = history.parentElement.parentElement.clientHeight;
    let height80Percent = parentHeight * 0.8;

    if (history.scrollHeight > height80Percent) {
        history.style.overflowY = 'scroll'; // Add vertical scroll
        history.style.height = height80Percent + 'px';
    }

    history.scrollTop = history.scrollHeight;

    document.getElementById('text').value = ''; // Clear the input field
}

/**
 * it hides the initial form and shows the chat
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
    document.getElementById('initial_form').style.display = 'none';
    document.getElementById('chat_interface').style.display = 'block';
}

