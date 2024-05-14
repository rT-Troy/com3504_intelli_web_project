document.addEventListener('DOMContentLoaded', function() {
    var db; // Declare db at a higher scope
    var request = indexedDB.open('MyDatabase', 2);

    request.onupgradeneeded = function(event) {
        var db = event.target.result; // Assign db on upgrade or creation
        if (!db.objectStoreNames.contains('nicknames')) {
            db.createObjectStore('nicknames', {keyPath: 'id'});
        }
    };

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };

    request.onsuccess = function(event) {
        db = event.target.result; // Also assign db on successful opening

        var tx = db.transaction('nicknames', 'readonly');
        var store = tx.objectStore('nicknames');
        var getReq = store.get('userNickname');  // Retrieve the nickname from IndexedDB

        getReq.onsuccess = function() {
            var nicknameInput = document.getElementById('nickname');
            if (getReq.result) {
                nicknameInput.value = getReq.result.nickname;
            } else {
                console.log('No nickname found in IndexedDB.');
            }
            nicknameInput.disabled = false;  // Enable input to ensure it is included in form submission
        };

        getReq.onerror = function(event) {
            console.error('Error fetching nickname from IndexedDB:', event.target.errorCode);
        };

        tx.oncomplete = function() {
            setupFormListener(db);
        };
    };
});

function setupFormListener(db) {
    var form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        var nickname = document.getElementById('nickname').value;

        if (nickname) {
            var writeTx = db.transaction('nicknames', 'readwrite');
            var writeStore = writeTx.objectStore('nicknames');
            writeStore.put({id: 'userNickname', nickname: nickname});

            writeTx.oncomplete = function() {
                console.log('Nickname saved to IndexedDB.');
                document.getElementById('nickname').disabled = false; // Ensure it's enabled before submission
                db.close(); // Close the db only after all operations, including the write, are complete
                form.submit(); // Now submit the form programmatically
            };

            writeTx.onerror = function(event) {
                console.error('Error saving nickname to IndexedDB:', event.target.errorCode);
            };
        } else {
            // If the nickname is empty, submit the form directly
            db.close(); // Ensure to close db even if not writing anything
            form.submit();
        }
    });
}