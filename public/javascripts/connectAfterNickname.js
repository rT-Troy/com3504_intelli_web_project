// Function to connect to the room after retrieving the nickname
function connectAfterNickname() {
    console.log("Connecting to Chat");
    // Trigger the click event of the "connect" button after retrieving the nickname
    document.getElementById('connect').click();
}

// Call the function to connect to the room after retrieving the nickname when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded event fired");
    var db; // Declare db at a higher scope
    var request = indexedDB.open('MyDatabase', 2);

    request.onupgradeneeded = function (event) {
        console.log("IndexedDB upgrade needed");
        var db = event.target.result; // Assign db on upgrade or creation
        if (!db.objectStoreNames.contains('nicknames')) {
            db.createObjectStore('nicknames', { keyPath: 'id' });
        }
    };

    request.onerror = function (event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
        console.log("IndexedDB request success");
        db = event.target.result; // Also assign db on successful opening

        var tx = db.transaction('nicknames', 'readonly');
        var store = tx.objectStore('nicknames');
        var getReq = store.get('userNickname'); // Retrieve the nickname from IndexedDB

        getReq.onsuccess = function () {
            console.log("Nickname retrieval success");
            var nicknameInput = document.getElementById('name');
            if (getReq.result) {
                nicknameInput.value = getReq.result.nickname;
            } else {
                console.log('No nickname found in IndexedDB.');
            }
            nicknameInput.disabled = false; // Enable input to ensure it is included in form submission

            // Call the function to connect to the room after retrieving the nickname
            connectAfterNickname();
        };

        getReq.onerror = function (event) {
            console.error('Error fetching nickname from IndexedDB:', event.target.errorCode);
        };
    };
});