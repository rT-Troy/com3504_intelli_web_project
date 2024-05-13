const addNewSlightsButtonEventListener = () => {
    const nickname = document.getElementById('nickname').value;
    const dateSeen = document.getElementById('dateSeen').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;
    const height = document.getElementById('height').value;
    const spread = document.getElementById('spread').value;
    const flowers = document.getElementById('flowers').value;
    const leaves = document.getElementById('leaves').value;
    const fruitsOrSeeds = document.getElementById('fruitsOrSeeds').value;
    const sunExposure = document.getElementById('sunExposure').value;
    // TODO:
    openSyncAddsIDB().then((db) => {
        const addItem = {
            nickname: nickname,
            dateSeen: dateSeen,
            location: location,
            description: description,
            height: height,
            spread: spread,
            flowers: flowers,
            leaves: leaves,
            fruitsOrSeeds: fruitsOrSeeds,
            sunExposure: sunExposure
        }
        addNewSlightToSync(db, addItem);
    });
    navigator.serviceWorker.ready
        .then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification("Add App",
                {body: "Add added! - " + addItems.nickname})
                .then(r =>
                    console.log(r)
                );
        });
}

window.onload = function () {
    // Add event listeners to buttons
    const add_submit = document.getElementById("add_submit")
    add_submit.addEventListener("click", addNewSlightsButtonEventListener)
}



// Function to insert a add item into the list
const insertAddInList = (add) => {
    if (add.text) {
        const copy = document.getElementById("add_template").cloneNode()
        copy.removeAttribute("id") // otherwise this will be hidden as well
        copy.innerText = add.text
        copy.setAttribute("data-add-id", add.id)

        // Insert sorted on string text order - ignoring case
        const addlist = document.getElementById("add_list")
        const children = addlist.querySelectorAll("li[data-add-id]")
        let inserted = false
        for (let i = 0; (i < children.length) && !inserted; i++) {
            const child = children[i]
            const copy_text = copy.innerText.toUpperCase()
            const child_text = child.innerText.toUpperCase()
            if (copy_text < child_text) {
                addlist.insertBefore(copy, child)
                inserted = true
            }
        }
        if (!inserted) { // Append child
            addlist.appendChild(copy)
        }
    }
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
                            serviceWorkerRegistration.showNotification("Add App",
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
        fetch('http://localhost:3000/adds')
            .then(function (res) {
                return res.json();
            }).then(function (newAdds) {
            openAddsIDB().then((db) => {
                insertAddInList(db, newAdds)
                deleteAllExistingAddsFromIDB(db).then(() => {
                    addNewAddsToIDB(db, newAdds).then(() => {
                        console.log("All new adds added to IDB")
                    })
                });
            });
        });

    } else {
        console.log("Offline mode")
        openAddsIDB().then((db) => {
            getAllAdds(db).then((adds) => {
                for (const add of adds) {
                    insertAddInList(add)
                }
            });
        });

    }
}