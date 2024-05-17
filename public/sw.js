importScripts('/javascripts/idb-utility.js');


// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {

        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("static");
            const urlsToCache = [
                '/',
                '/add',
                '/javascripts/idb-utility.js',
                '/javascripts/camera.js',
                '/javascripts/discussionroom.js',
                '/javascripts/location.js',
                '/javascripts/add.js',
                '/javascripts/index.js',
                '/stylesheets/style.css',
                '/stylesheets/add.css',
                '/stylesheets/display.css',
                '/javascripts/display.js'
            ];

            const ids = await getAllIdsFromIndexedDB();
            ids.forEach(id => {
                urlsToCache.push(`/display/${id}`);
            });

            await cache.addAll(urlsToCache);
            console.log('Service Worker: App Shell Cached');
        } catch (error) {
            console.log("Error occurred while caching...", error);
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
    const url = new URL(event.request.url);

    // Check if the request is for the plant sightings API
    if (url.pathname === '/plantsightings') {
        event.respondWith((async () => {
            try {
                // Try to fetch from the network
                const networkResponse = await fetch(event.request);
                // Optionally, you can update the cache with the new data
                const cache = await caches.open("dynamic");
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                console.log('Service Worker: Fetching from Cache due to network failure:', event.request.url);
                // If the network is unavailable, try to get the response from the cache
                const cache = await caches.open("dynamic");
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                } else {
                    // Return an empty response or a default fallback response
                    return new Response(JSON.stringify([]), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
        })());
    }else if (/^\/display\/.+/.test(url.pathname)) {
        event.respondWith((async () => {
            const cache = await caches.open("static");
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                console.log('Service Worker: Fetching from Cache:', event.request.url);
                return cachedResponse;
            }
            console.log('Service Worker: Fetching from URL:', event.request.url);
            return fetch(event.request);
        })());
    }else {
        // Existing fetch logic for other requests
        event.respondWith((async () => {
            const cache = await caches.open("static");
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                console.log('Service Worker: Fetching from Cache:', event.request.url);
                return cachedResponse;
            }
            console.log('Service Worker: Fetching from URL:', event.request.url);
            return fetch(event.request);
        })());
    }
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
                    // Pre delete the sync idb, because the fetch may skip this step
                    fetch('http://localhost:3000/plantsightings')
                        .then(() => {
                            deleteSyncAddFromIDB(syncPostDB, syncAdd.id);
                        }).catch(() => {
                        console.log('Service Worker: Syncing new failed, service offline');
                    } )
                    // if(syncAdd.photoData) {
                    //     // Assume syncAdd.photo is base64
                    //     formData.append('photoData', syncAdd.photo);
                    // }

                    // Fetch with FormData
                    console.log('fetching post');
                    fetch('http://localhost:3000/add-todo', {
                        method: 'POST',
                        body: formData
                    }).then(() => {
                        console.log('Fetch post successful!');
                        // Send a notification
                        self.registration.showNotification('Add Synced', {
                            body: 'Add synced successfully!',
                        });
                    }).catch((err) => {
                        console.log('Service Worker: Syncing new failed, service offline');
                    });
                }
            });
        });
    }
});

