document.addEventListener('DOMContentLoaded', function() {
    var request = indexedDB.open('MyDatabase', 2);  // Open the IndexedDB

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };

    request.onsuccess = function(event) {
        var db = event.target.result;
        var tx = db.transaction('nicknames', 'readonly');
        var store = tx.objectStore('nicknames');
        var getRequest = store.get('userNickname');  // Get the 'userNickname' from the store

        getRequest.onsuccess = function() {
            // Get the stored nickname and compare it to the server nickname
            var storedNickname = getRequest.result ? getRequest.result.nickname : '';
            var serverNickname = "<%= plantsighting.nickname %>".trim().toLowerCase();  // Assuming this value is dynamically injected by the server

            // Ensure both are strings and trim any whitespace
            var localNickname = storedNickname.trim().toLowerCase();
            console.log("Local Nickname: ", localNickname);
            console.log("Server Nickname: ", serverNickname);

            if (localNickname !== serverNickname || localNickname === '') {



            }
        };

        getRequest.onerror = function(event) {
            console.error('Error fetching nickname from IndexedDB:', event.target.errorCode);
        };

        tx.oncomplete = function() {
            db.close();  // Close the db when the transaction is done
        };
    };
});