document.addEventListener('DOMContentLoaded', function() {
    var db;
    var request = indexedDB.open('MyDatabase', 2); // Ensure this is the same version as where you created/modified the DB schema

    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;

        var form = document.querySelector('form');
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Stop the form from submitting immediately

            var nickname = document.getElementById('nickname').value;
            var tx = db.transaction('nicknames', 'readwrite');
            var store = tx.objectStore('nicknames');
            var addNickname = store.put({ id: 'userNickname', nickname: nickname });

            addNickname.onsuccess = function() {
                console.log('Nickname saved to IndexedDB:', nickname);
                window.location.href = '/'; // Redirect or handle the navigation as necessary
            };

            addNickname.onerror = function(event) {
                console.error('Error saving nickname to IndexedDB:', event.target.error);
            };

            tx.oncomplete = function() {
                console.log('Transaction completed.');
            };

            tx.onerror = function(event) {
                console.error('Transaction error:', event.target.error);
            };
        });
    };
});