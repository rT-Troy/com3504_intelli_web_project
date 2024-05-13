// Function to handle adding a new todo
const addNewSlightToSync = (syncAddIDB, items) => {
    // Retrieve todo text and add it to the IndexedDB
    addItems = items
    if (noNullItem(addItems)) {
        const transaction = syncAddIDB.transaction(["sync-adds"], "readwrite")
        const addStore = transaction.objectStore("sync-adds")

        const addRequest = addStore.add(addItems)

        addRequest.addEventListener("success", () => {
            console.log("Added " + "#" + addRequest.result + ": " + addItems.nickname)
            const getRequest = addStore.get(addRequest.result)
            getRequest.addEventListener("success", () => {
                console.log("Found " + JSON.stringify(getRequest.result))
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

// Function to add new todos to IndexedDB and return a promise
const addNewAddsToIDB = (addIDB, adds) => {
    return new Promise((resolve, reject) => {
        const transaction = addIDB.transaction(["adds"], "readwrite");
        const addStore = transaction.objectStore("adds");

        const addPromises = adds.map(add => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = addStore.add(add);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + add.text);
                    const getRequest = addStore.get(addRequest.result);
                    getRequest.addEventListener("success", () => {
                        console.log("Found " + JSON.stringify(getRequest.result));
                        // Assume insertAddInList is defined elsewhere
                        //TODO:
                        insertAddInList(getRequest.result);
                        resolveAdd(); // Resolve the add promise
                    });
                    getRequest.addEventListener("error", (event) => {
                        rejectAdd(event.target.error); // Reject the add promise if there's an error
                    });
                });
                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error); // Reject the add promise if there's an error
                });
            });
        });

        // Resolve the main promise when all add operations are completed
        Promise.all(addPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};


// Function to remove all todos from idb
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




// Function to get the todo list from the IndexedDB
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


// Function to get the todo list from the IndexedDB
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
const deleteSyncAddFromIDB = (syncAddIDB, id) => {
    const transaction = syncAddIDB.transaction(["sync-adds"], "readwrite")
    const addStore = transaction.objectStore("sync-adds")
    const deleteRequest = addStore.delete(id)
    deleteRequest.addEventListener("success", () => {
        console.log("Deleted " + id)
    })
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
