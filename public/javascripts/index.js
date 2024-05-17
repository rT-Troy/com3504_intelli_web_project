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
        displayOfflinePlantSightings();
    }



    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('change', function(event) {
            event.preventDefault();
            fetchAndDisplayPlantSightings();
        });
    }

    const sortOrderSelect = document.getElementById('sortOrder');
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', function() {
            if (sortOrderSelect.value === 'distance') {
                handleSortChange(sortOrderSelect);
            } else {
                fetchAndDisplayPlantSightings(sortOrderSelect.value);
            }
        });
    }

    function fetchAndDisplayPlantSightings(sortOrder = 'newest', userLat = null, userLon = null) {
        if (navigator.onLine) {
            fetch('http://localhost:3000/plantsightings')
                .then(response => response.json())
                .then(newAdds => {
                    processSightings(newAdds, sortOrder, userLat, userLon);
                    openAddsIDB().then(db => {
                        deleteAllExistingAddsFromIDB(db).then(() => {
                            addNewAddsToIDB(db, newAdds).then(() => {
                                console.log("All new plant sightings added to IDB");
                            });
                        });
                    });
                })
                .catch(error => {
                    console.error('Error fetching plant sightings:', error);
                });
        } else {
            displayOfflinePlantSightings(sortOrder, userLat, userLon);
        }
    }

    function displayOfflinePlantSightings(sortOrder = 'newest', userLat = null, userLon = null) {
        Promise.all([openAddsIDB(), openSyncAddsIDB()])
            .then(([addsDb, syncDb]) => {
                return Promise.all([getAllAdds(addsDb), getAllSyncAdds(syncDb)]);
            })
            .then(([addsSightings, syncAddsSightings]) => {
                const combinedSightings = [...addsSightings, ...syncAddsSightings];
                processSightings(combinedSightings, sortOrder, userLat, userLon);
            })
            .catch(error => {
                console.error('Error fetching plant sightings from IndexedDB:', error);
            });
    }

    function processSightings(sightings, sortOrder, userLat, userLon) {
        const formData = new FormData(filterForm);
        const filters = {};
        formData.forEach((value, key) => {
            filters[key] = value;
        });
        let filteredSightings = applyFilters(sightings, filters);
        if (sortOrder === 'distance' && userLat !== null && userLon !== null) {
            filteredSightings.forEach(sighting => {
                if (sighting.location && sighting.location.coordinates) {
                    sighting.distance = calculateDistance(userLat, userLon, sighting.location.coordinates[1], sighting.location.coordinates[0]);
                } else {
                    sighting.distance = Infinity;
                }
            });
        }
        filteredSightings = sortSightings(filteredSightings, sortOrder);
        indexDisplayInsert(null, filteredSightings);
    }

    function applyFilters(sightings, filters) {
        return sightings.filter(sighting => {
            let matches = true;
            if (filters.status && filters.status !== 'all') {
                matches = matches && sighting.identification.status === filters.status;
            }
            if (filters.flowers) {
                const hasFlowers = filters.flowers === 'flowersTrue';
                matches = matches && sighting.plantCharacteristics.flowers === hasFlowers;
            }
            if (filters.leaves) {
                const hasLeaves = filters.leaves === 'leavesTrue';
                matches = matches && sighting.plantCharacteristics.leaves === hasLeaves;
            }
            if (filters.fruitsOrSeeds) {
                const hasFruitsOrSeeds = filters.fruitsOrSeeds === 'fruitsOrSeedsTrue';
                matches = matches && sighting.plantCharacteristics.fruitsOrSeeds === hasFruitsOrSeeds;
            }
            if (filters.sunExposure) {
                matches = matches && sighting.plantCharacteristics.sunExposure === filters.sunExposure.toLowerCase();
            }
            return matches;
        });
    }

    document.getElementById('addNewPlantSighting').addEventListener('click', function() {
        window.location.href = '/add';
    });

    function handleSortChange(selectElement) {
        var sortOrder = selectElement.value;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;

                fetchAndDisplayPlantSightings(sortOrder, userLat, userLon);
            }, function(error) {
                console.error('Error getting user location:', error);
                alert('Location access is required to sort by distance. Default sorting will be applied.');
                fetchAndDisplayPlantSightings(sortOrder);
            });
        } else {
            fetchAndDisplayPlantSightings(sortOrder);
        }
    }

    function sortSightings(sightings, sortOrder) {
        return sightings.sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.dateSeen) - new Date(a.dateSeen);
            } else if (sortOrder === 'oldest') {
                return new Date(a.dateSeen) - new Date(b.dateSeen);
            } else if (sortOrder === 'distance') {
                return a.distance - b.distance;
            }
        });
    }

    function openAddsIDB() {
        return new Promise((resolve, reject) => {
            const dbName = 'adds';
            const dbVersion = 1;
            const request = indexedDB.open(dbName, dbVersion);

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('adds')) {
                    db.createObjectStore('adds', { keyPath: '_id' });
                }
            };

            request.onsuccess = function(event) {
                resolve(event.target.result);
            };

            request.onerror = function(event) {
                reject('Failed to open indexDB: ' + event.target.error);
            };
        });
    }

    function openSyncAddsIDB() {
        return new Promise((resolve, reject) => {
            const dbName = 'sync-adds';
            const dbVersion = 1;
            const request = indexedDB.open(dbName, dbVersion);

            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('sync-adds')) {
                    db.createObjectStore('sync-adds', { keyPath: '_id' });
                }
            };

            request.onsuccess = function(event) {
                resolve(event.target.result);
            };

            request.onerror = function(event) {
                reject('Failed to open indexDB: ' + event.target.error);
            };
        });
    }

    function deleteAllExistingAddsFromIDB(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['adds'], 'readwrite');
            const objectStore = transaction.objectStore('adds');
            const request = objectStore.clear();

            request.onsuccess = function() {
                resolve();
            };

            request.onerror = function(event) {
                reject('Failed to delete existing adds from indexDB: ' + event.target.error);
            };
        });
    }

    function addNewAddsToIDB(db, newAdds) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['adds'], 'readwrite');
            const objectStore = transaction.objectStore('adds');

            newAdds.forEach(plantsighting => {
                objectStore.put(plantsighting);
            });

            transaction.oncomplete = function() {
                resolve();
            };

            transaction.onerror = function(event) {
                reject('Failed to add new adds to indexDB: ' + transaction.error);
            };
        });
    }

    function getAllAdds(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['adds'], 'readonly');
            const objectStore = transaction.objectStore('adds');
            const request = objectStore.getAll();

            request.onsuccess = function(event) {
                resolve(event.target.result);
            };

            request.onerror = function(event) {
                reject('Failed to fetch adds from indexDB: ' + event.target.error);
            };
        });
    }

    function getAllSyncAdds(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['sync-adds'], 'readonly');
            const objectStore = transaction.objectStore('sync-adds');
            const request = objectStore.getAll();

            request.onsuccess = function(event) {
                resolve(event.target.result);
            };

            request.onerror = function(event) {
                reject('Failed to fetch sync-adds from indexDB: ' + event.target.error);
            };
        });
    }

    function indexDisplayInsert(db, newAdds) {
        const container = document.getElementById("planrow");
        container.innerHTML = '';

        newAdds.forEach(plantsighting => {
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

                if (plantsighting.distance != null) {
                    const distanceParagraph = document.createElement('p');
                    distanceParagraph.innerHTML = `<strong>Distance:</strong> ${plantsighting.distance.toFixed(2)} km`;
                    colDiv.appendChild(distanceParagraph);
                }
            }

            container.appendChild(colDiv);
        });
    }

    // Function to calculate distance between two coordinates using Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
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

        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                // Notifications are allowed, proceed as needed
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        navigator.serviceWorker.ready
                            .then(function (serviceWorkerRegistration) {
                                serviceWorkerRegistration.showNotification("Plant Sighting App",
                                    {body: "Notifications are enabled!"});
                            });
                    }
                });
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;

                if (navigator.onLine) {
                    fetchAndDisplayPlantSightings('newest', userLat, userLon);
                } else {
                    displayOfflinePlantSightings('newest', userLat, userLon);
                }
            }, function(error) {
                console.error('Error getting user location:', error);
                alert('Location access is required to sort by distance. Default sorting will be applied.');
                if (navigator.onLine) {
                    fetchAndDisplayPlantSightings();
                } else {
                    displayOfflinePlantSightings();
                }
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
            if (navigator.onLine) {
                fetchAndDisplayPlantSightings();
            } else {
                displayOfflinePlantSightings();
            }
        }
    }
});
