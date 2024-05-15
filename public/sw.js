importScripts('/javascripts/idb-utility.js');


// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            await cache.addAll([
                '/',
                '/add',
                '/javascripts/add.js',
                '/javascripts/index.js',
                '/javascripts/idb-utility.js',
                '/javascripts/camera.js',
                '/javascripts/discussionroom.js',
                '/javascripts/distance.js',
                '/javascripts/location.js',
                '/stylesheets/style.css',
                '/stylesheets/add.css'
            ]);
            console.log('Service Worker: App Shell Cached');
        }
        catch{
            console.log("error occured while caching...")
        }

    })());
});

// clear cache on reload
self.addEventListener('activate', event => {
// Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if(cache !== "static") {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

// Fetch event to fetch from cache first
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open("static");
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            console.log('Service Worker: Fetching from Cache: ', event.request.url);
            return cachedResponse;
        }
        console.log('Service Worker: Fetching from URL: ', event.request.url);
        return fetch(event.request);
    })());
});

//Sync event to sync the todos
self.addEventListener('sync', event => {
    if (event.tag === 'sync-add') {
        console.log('Service Worker: Syncing new Adds');
        openSyncAddsIDB().then((syncPostDB) => {
            getAllSyncAdds(syncPostDB).then((syncAdds) => {
                for (const syncAdd of syncAdds) {
                    console.log('Service Worker: Syncing new Add: ', syncAdd);
                    // Create a FormData object
                    const formData = new URLSearchParams();

                    // Iterate over the properties of the JSON object and append them to FormData
                    for (const key in syncAdd) {
                        if (syncAdd.hasOwnProperty(key)) {
                            formData.append(key, syncAdd[key]);
                        }
                    }

                    // Fetch with FormData instead of JSON
                    fetch('http://localhost:3000/add-todo', {
                        method: 'POST',
                        body: formData,
                        // file: myImg,
                    }).then(() => {
                        console.log('Service Worker: Syncing new Add: ', syncAdd, ' done');
                        console.log("id:" , syncAdd.id);
                        deleteSyncAddFromIDB(syncPostDB,syncAdd.id);
                        // Send a notification
                        self.registration.showNotification('Add Synced', {
                            body: 'Add synced successfully!',
                        });
                    }).catch((err) => {
                        console.error('Service Worker: Syncing new Add: ', syncAdd, ' failed');
                    });
                }
            });
        });
    }
});
