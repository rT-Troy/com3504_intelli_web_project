document.addEventListener('DOMContentLoaded', function() {
    var dbVersion = 2; // Increase the version to trigger onupgradeneeded if the store does not exist

    // Open the IndexedDB database 'MyDatabase'
    var dbRequest = indexedDB.open('MyDatabase', dbVersion);

    dbRequest.onupgradeneeded = function(event) {
        var db = event.target.result;
        // Ensure the 'nicknames' object store is created
        if (!db.objectStoreNames.contains('nicknames')) {
            db.createObjectStore('nicknames', {keyPath: 'id'});
            console.log('Object store "nicknames" created');
        }
    };

    dbRequest.onsuccess = function(event) {
        var db = event.target.result;
        try {
            var transaction = db.transaction('nicknames', 'readonly');
            var store = transaction.objectStore('nicknames');
            var getRequest = store.get('userNickname');

            getRequest.onsuccess = function() {
                var userNickname = getRequest.result ? getRequest.result.nickname : '';
                var myPlantsButton = document.getElementById('myPlants');
                if (userNickname) {
                    myPlantsButton.addEventListener('click', function() {
                        window.location.href = `/?nickname=${userNickname}`;
                    });
                } else {
                    window.location.href = '/nickname';  // Redirect to the nickname setup page
                }
            };

            getRequest.onerror = function() {
                console.error('Error fetching nickname from IndexedDB');
                window.location.href = '/error';  // Redirect to an error handling page
            };
        } catch (error) {
            console.error('Error creating transaction or getting object store:', error);
            window.location.href = '/error';  // Redirect to an error handling page
        }
    };

    dbRequest.onerror = function() {
        console.error('Error opening IndexedDB');
        window.location.href = '/error';  // Redirect to an error handling page
    };

    var showAllButton = document.getElementById('showAll');
    if (showAllButton) {
        showAllButton.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
});

document.getElementById('addNewPlantSighting').addEventListener('click', function() {
    window.location.href = '/add';
});