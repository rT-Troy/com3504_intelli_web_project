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

    if (navigator.onLine) {
        fetchAndDisplayPlantSightings();
    } else {
        console.log("Offline mode");
        openAddsIDB().then((db) => {
            getAllAdds(db).then((plantSightings) => {
                indexDisplayInsert(db, plantSightings, 'date'); // or 'distance' if needed
            }).catch(err => {
                console.error('Error fetching plant sightings from IndexedDB:', err);
            });
        }).catch(err => {
            console.error('Error opening IndexedDB:', err);
        });
    }

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

function fetchAndDisplayPlantSightings() {
    fetch('http://localhost:3000/plantsightings')
        .then(function (res) {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(function (newAdds) {
            openAddsIDB().then((db) => {
                indexDisplayInsert(db, newAdds);
                deleteAllExistingAddsFromIDB(db).then(() => {
                    addNewAddsToIDB(db, newAdds).then(() => {
                        console.log("All new plant sightings added to IDB");
                    });
                });
            });
        })
        .catch(function (error) {
            console.error("Error fetching plant sightings:", error);
            openAddsIDB().then((db) => {
                getAllAdds(db).then((plantSightings) => {
                    indexDisplayInsert(db, plantSightings, 'date');
                }).catch(err => {
                    console.error('Error fetching plant sightings from IndexedDB:', err);
                });
            }).catch(err => {
                console.error('Error opening IndexedDB:', err);
            });
        });
}



// Function to open the IndexedDB
function openAddsIDB() {
    return new Promise((resolve, reject) => {
        const dbName = 'adds';
        const dbVersion = 1;
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('adds')) {
                db.createObjectStore('adds', { keyPath: '_id' });
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject('Failed to open indexDB: ' + event.target.error);
        };
    });
}

// Function to delete all existing records from the IndexedDB
function deleteAllExistingAddsFromIDB(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['adds'], 'readwrite');
        const objectStore = transaction.objectStore('adds');
        const request = objectStore.clear();

        request.onsuccess = function () {
            resolve();
        };

        request.onerror = function (event) {
            reject('Failed to delete existing adds from indexDB: ' + event.target.error);
        };
    });
}

// Function to add new records to the IndexedDB
function addNewAddsToIDB(db, newAdds) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['adds'], 'readwrite');
        const objectStore = transaction.objectStore('adds');

        newAdds.forEach(plantsighting => {
            objectStore.put(plantsighting);
        });

        transaction.oncomplete = function () {
            resolve();
        };

        transaction.onerror = function (event) {
            reject('Failed to add new adds to indexDB: ' + transaction.error);
        };
    });
}

// Function to insert and display new plant sightings
function indexDisplayInsert(db, newAdds) {
    const transaction = db.transaction(['adds'], 'readwrite');
    const objectStore = transaction.objectStore('adds');

    const container = document.getElementById("planrow");
    container.innerHTML = '';

    newAdds.forEach(plantsighting => {
        objectStore.put(plantsighting);

        const colDiv = document.createElement('div');
        colDiv.className = 'col-sm-6 col-md-4 col-lg-3';

        const link = document.createElement('a');
        link.href = `/display/${plantsighting._id}`;

        const img = document.createElement('img');
        img.src = plantsighting.photo;
        img.className = 'img-thumbnail';
        img.width = 200;
        img.height = 200;
        img.alt = 'Plant Photo';

        link.appendChild(img);
        colDiv.appendChild(link);

        const dateParagraph = document.createElement('p');
        dateParagraph.innerHTML = `<strong>Date Seen:</strong> ${new Date(plantsighting.dateSeen).toDateString()}`;
        colDiv.appendChild(dateParagraph);

        if (plantsighting.location && plantsighting.location.coordinates) {
            const latSpan = document.createElement('span');
            latSpan.style.display = 'none';
            latSpan.id = `lat_${plantsighting._id}`;
            latSpan.textContent = plantsighting.location.coordinates[1];
            colDiv.appendChild(latSpan);

            const longSpan = document.createElement('span');
            longSpan.style.display = 'none';
            longSpan.id = `long_${plantsighting._id}`;
            longSpan.textContent = plantsighting.location.coordinates[0];
            colDiv.appendChild(longSpan);
        }

        if (sortOrder === 'distance' && plantsighting.distance != null) {
            const distanceParagraph = document.createElement('p');
            distanceParagraph.innerHTML = `<strong>Distance:</strong> ${plantsighting.distance.toFixed(2)} km`;
            colDiv.appendChild(distanceParagraph);
        }

        container.appendChild(colDiv);
    });

    transaction.oncomplete = function () {
        console.log('Transaction completed: database modification finished.');
    };

    transaction.onerror = function (event) {
        console.log('Transaction not opened due to error: ' + transaction.error);
    };

    return transaction.complete;
}

// Function to get all adds from IndexedDB
function getAllAdds(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['adds'], 'readonly');
        const objectStore = transaction.objectStore('adds');
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject('Failed to fetch adds from indexDB: ' + event.target.error);
        };
    });
}


// Register service worker to control making site work offline
window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    // Check if the browser supports the Notification API
    if ("Notification" in window) {
        // Check if the user has granted permission to receive notifications
        if (Notification.permission === "granted") {
            // Notifications are allowed, you can proceed to create notifications
            // Or do whatever you need to do with notifications
        } else if (Notification.permission !== "denied") {
            // If the user hasn't been asked yet or has previously denied permission,
            // you can request permission from the user
            Notification.requestPermission().then(function (permission) {
                // If the user grants permission, you can proceed to create notifications
                if (permission === "granted") {
                    navigator.serviceWorker.ready
                        .then(function (serviceWorkerRegistration) {
                            serviceWorkerRegistration.showNotification("Todo App",
                                {body: "Notifications are enabled!"})
                                // .then(r =>
                                //     console.log(r)
                                // );
                        });
                }
            });
        }
    }
    if (navigator.onLine) {
        fetchAndDisplayPlantSightings();
    } else {
        console.log("Offline mode");
        openAddsIDB().then((db) => {
            getAllAdds(db).then((plantSightings) => {
                indexDisplayInsert(db, plantSightings, 'date'); // or 'distance' if needed
            }).catch(err => {
                console.error('Error fetching plant sightings from IndexedDB:', err);
            });
        }).catch(err => {
            console.error('Error opening IndexedDB:', err);
        });
    }
}
