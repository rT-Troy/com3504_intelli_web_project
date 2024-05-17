// Function to handle adding a new add
const addNewSlightToSync = (syncAddIDB, items) => {
    // Retrieve add text and add it to the IndexedDB
    const addItems = items
    // TODO:
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
}

function noNullItem(items) {
    return Object.values(items).every(value => {
        if (typeof value === 'object' && value !== null) {
            return noNullItem(value);
        }
        return value !== "" && value !== undefined && value !== null;
    });
}

const addNewMessagesToIDB = (messageIDB, messages) => {
    return new Promise((resolve, reject) => {
        const transaction = messageIDB.transaction(["messages"], "readwrite");
        const todoStore = transaction.objectStore("messages");

        const addPromises = messages.map(todo => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = todoStore.add(todo);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + todo.text);
                    const getRequest = todoStore.get(addRequest.result);
                    getRequest.addEventListener("success", () => {
                        console.log("Found " + JSON.stringify(getRequest.result));
                        // Assume insertTodoInList is defined elsewhere
                        // insertTodoInList(getRequest.result);
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



// Function to remove all adds from idb
const deleteAllExistingMessagesFromIDB = (messageIDB) => {
        const transaction = messageIDB.transaction(["messages"], "readwrite");
        const messageStore = transaction.objectStore("messages");
        const clearRequest = messageStore.clear();

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
const getMessageAdds = (addIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = addIDB.transaction(["messages"]);
        const addStore = transaction.objectStore("messages");
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

const deleteSyncMessageFromIDB = (syncAddIDB, id) => {
    return new Promise((resolve, reject) => {
        const transaction = syncAddIDB.transaction(["sync-messages"], "readwrite");
        const addStore = transaction.objectStore("sync-messages");
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


function openMessagesIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("messages", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore('messages', {keyPath: '_id'});
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

// Get all id from indexedDB
async function getAllIdsFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('adds', 1);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['adds'], 'readonly');
            const objectStore = transaction.objectStore('adds');
            const getAllRequest = objectStore.getAll();

            getAllRequest.onsuccess = function(event) {
                resolve(event.target.result.map(item => item._id));
            };

            getAllRequest.onerror = function(event) {
                reject('Error fetching IDs from IndexedDB');
            };
        };
        request.onerror = function(event) {
            reject('Error opening IndexedDB');
        };
    });
}