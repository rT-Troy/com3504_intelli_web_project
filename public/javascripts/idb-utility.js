// Function to handle adding a new add
const addNewSlightToSync = (syncAddIDB, items) => {
    // Retrieve add text and add it to the IndexedDB
    const addItems = items
    // TODO:
    if (true) {
        const transaction = syncAddIDB.transaction(["sync-adds"], "readwrite")
        const addStore = transaction.objectStore("sync-adds")

        const addRequest = addStore.add(addItems)

        addRequest.addEventListener("success", () => {
            const getRequest = addStore.get(addRequest.result)
            getRequest.addEventListener("success", () => {
                // Send a sync message to the service worker
                navigator.serviceWorker.ready.then((sw) => {
                    sw.sync.register("sync-add")
                }).then(() => {
                    console.log("Sync registered");
                }).catch((err) => {
                    console.log("Sync registration failed: " + JSON.stringify(err))
                })
            })
        })
    }else {
        console.log("Please insert all information!")
    }
}

function noNullItem(items) {
    return Object.values(items).every(value => {
        if (typeof value === 'object' && value !== null) {
            return noNullItem(value);
        }
        return value !== "" && value !== undefined && value !== null;
    });
}

// Function to add new adds to IndexedDB and return a promise
const addNewAddsToIDB = (addIDB, adds) => {
    return new Promise((resolve, reject) => {
        const transaction = addIDB.transaction(["adds"], "readwrite");
        transaction.oncomplete = () => console.log("Transaction completed.");
        transaction.onerror = (event) => {
            console.log("Transaction failed:", event.target.error);
            reject(event.target.error);
        };

        const addStore = transaction.objectStore("adds");
        console.log("Object store opened.");

        const addPromises = adds.map(add => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = addStore.add(add);
                addRequest.onsuccess = () => {
                    const getRequest = addStore.get(addRequest.result);
                    getRequest.onsuccess = () => {
                        resolveAdd(getRequest.result); // Resolve with the retrieved object
                    };
                    getRequest.onerror = (event) => {
                        console.log("Error retrieving added record:", event.target.error);
                        rejectAdd(event.target.error);
                    };
                };
                addRequest.onerror = (event) => {
                    console.log("Error adding record:", event.target.error);
                    rejectAdd(event.target.error);
                };
            });
        });

        Promise.all(addPromises)
            .then(results => {
                console.log("All adds processed:", results);
                resolve(results);  // Resolve the main promise with all results
            })
            .catch(error => {
                console.log("Error processing adds:", error);
                reject(error);
            });
    });
};



// Function to remove all adds from idb
const deleteAllExistingAddsFromIDB = (addIDB) => {
        const transaction = addIDB.transaction(["adds"], "readwrite");
        const addStore = transaction.objectStore("adds");
        const clearRequest = addStore.clear();

        return new Promise((resolve, reject) => {
            clearRequest.addEventListener("success", () => {
                resolve();
            });

            clearRequest.addEventListener("error", (event) => {
                reject(event.target.error);
            });
        });
};




// Function to get the add list from the IndexedDB
const getAllAdds = (addIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = addIDB.transaction(["adds"]);
        const addStore = transaction.objectStore("adds");
        const getAllRequest = addStore.getAll();

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            resolve(event.target.result); // Use event.target.result to get the result
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}


// Function to get the add list from the IndexedDB
const getAllSyncAdds = (syncAddIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = syncAddIDB.transaction(["sync-adds"]);
        const addStore = transaction.objectStore("sync-adds");
        const getAllRequest = addStore.getAll();

        getAllRequest.addEventListener("success", () => {
            resolve(getAllRequest.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

// Function to delete a syn
// const deleteSyncAddFromIDB = (syncAddIDB, id) => {
//     const transaction = syncAddIDB.transaction(["sync-adds"], "readwrite")
//     const addStore = transaction.objectStore("sync-adds")
//     const deleteRequest = addStore.delete(id)
//     deleteRequest.addEventListener("success", () => {
//         console.log("Deleted " + id)
//     })
// }

const deleteSyncAddFromIDB = (syncAddIDB, id) => {
    return new Promise((resolve, reject) => {
        const transaction = syncAddIDB.transaction(["sync-adds"], "readwrite");
        const addStore = transaction.objectStore("sync-adds");
        const deleteRequest = addStore.delete(id);
        deleteRequest.onsuccess = () => {
            console.log("Deleted " + id);
            resolve();
        };
        deleteRequest.onerror = () => {
            console.error("Error deleting " + id);
            reject(deleteRequest.error);
        };
    });
}


function openAddsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("adds", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('adds', {keyPath: '_id'});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

function openSyncAddsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sync-adds", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('sync-adds', {keyPath: 'id', autoIncrement: true});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}
