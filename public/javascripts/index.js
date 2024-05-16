// Function to insert a add item into the list
function indexDisplayInsert(db, newAdds) {
    const transaction = db.transaction(['adds'], 'readwrite');
    const objectStore = transaction.objectStore('adds');

    const container = document.querySelector('.row');
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

        const p = document.createElement('p');
        p.innerHTML = `<strong>Date Seen:</strong> ${new Date(plantsighting.dateSeen).toDateString()}`;

        link.appendChild(img);
        colDiv.appendChild(link);
        colDiv.appendChild(p);
        container.appendChild(colDiv);
    });

    return transaction.complete;
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
                            serviceWorkerRegistration.sync.register('sync')
                            serviceWorkerRegistration.showNotification("Todo App",
                                {body: "Notifications are enabled!"})
                                .then(r =>
                                    console.log(r)
                                );
                        });
                }
            });
        }
    }
    if (navigator.onLine) {
        fetch('http://localhost:3000/plantsightings')
            .then(function (res) {
                return res.json();
            }).then(function (newAdds) {
            openAddsIDB().then((db) => {
                indexDisplayInsert(db, newAdds)
                deleteAllExistingAddsFromIDB(db).then(() => {
                    addNewAddsToIDB(db, newAdds).then(() => {
                        console.log("All new todos added to IDB")
                    })
                });
            });
            })

    } else {
        console.log("Offline mode")
        openAddsIDB().then((db) => {
            getAllAdds(db).then((adds) => {
                for (const add of adds) {
                    indexDisplayInsert(adds)
                }
            });
        });
    }
}