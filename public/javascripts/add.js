const addNewSlightsButtonEventListener = () => {
    const nicknameElement = document.getElementById('nickname');
    const dateSeenElement = document.getElementById('dateSeen');
    const descriptionElement = document.getElementById('description');
    const heightElement = document.getElementById('height');
    const spreadElement = document.getElementById('spread');
    const flowersElement = document.getElementById('flowers');
    const leavesElement = document.getElementById('leaves');
    const fruitsOrSeedsElement = document.getElementById('fruitsOrSeeds');
    const sunExposureElement = document.getElementById('sunExposure');
    const myImgElement = document.getElementById('myImg');
    const locationElement = document.getElementById('location');
    const identificationNameElement = document.getElementById('identificationName');

    if (!nicknameElement || !dateSeenElement || !descriptionElement || !heightElement || !spreadElement ||
        !flowersElement || !leavesElement || !fruitsOrSeedsElement || !sunExposureElement || !myImgElement ||
        !locationElement || !identificationNameElement) {
        console.error('One or more form elements are missing');
        return;
    }

    const addItem = {
        nickname: nicknameElement.value,
        dateSeen: dateSeenElement.value,
        description: descriptionElement.value,
        height: heightElement.value,
        spread: spreadElement.value,
        flowers: flowersElement.checked,
        leaves: leavesElement.checked,
        fruitsOrSeeds: fruitsOrSeedsElement.checked,
        sunExposure: sunExposureElement.value,
        location: locationElement.value,
        identificationName: identificationNameElement.value,
        photo: '', // Placeholder for the image base64 string
        photoPath: ''
    };

    const formData = new FormData();
    formData.append('nickname', nicknameElement.value);
    formData.append('dateSeen', dateSeenElement.value);
    formData.append('description', descriptionElement.value);
    formData.append('height', heightElement.value);
    formData.append('spread', spreadElement.value);
    formData.append('flowers', flowersElement.checked);
    formData.append('leaves', leavesElement.checked);
    formData.append('fruitsOrSeeds', fruitsOrSeedsElement.checked);
    formData.append('sunExposure', sunExposureElement.value);
    formData.append('location', locationElement.value);
    formData.append('identificationName', identificationNameElement.value);

    if (myImgElement.files.length > 0) {
        const file = myImgElement.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            addItem.photo = reader.result; // base64 encoded string

            // Store data in IndexedDB for offline use
            openSyncAddsIDB().then((db) => {
                addNewSlightToSync(db, addItem).then(() => {
                    console.log('Data stored in IndexedDB for offline use.');
                }).catch((error) => {
                    console.error('Failed to store data in IndexedDB:', error);
                });
            });

            // Attempt to send data to the server
            formData.append('myImg', file);
            fetch('/add-todo', {
                method: 'POST',
                body: formData
            }).then(response => {
                if (response.ok) {
                    console.log('Sighting added successfully');
                    document.getElementById('status').innerText = 'Sighting added successfully';
                } else {
                    console.error('Failed to add sighting');
                    document.getElementById('status').innerText = 'Failed to add sighting';
                }
            }).catch(error => {
                console.error('Error:', error);
                document.getElementById('status').innerText = 'Error: ' + error.message;
            });

            // Request notification permission
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
                        serviceWorkerRegistration.showNotification("Add App", {
                            body: "Add added! - " + formData.get('nickname')
                        }).then(r => console.log(r));
                    });
                } else {
                    console.error('Notification permission not granted');
                }
            });
        };
        reader.readAsDataURL(file); // Convert file to base64 string
    } else {
        console.error('No file selected');
    }
};

window.onload = function () {
    // Add event listeners to buttons
    const add_submit = document.getElementById("add_submit");
    add_submit.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default form submission
        addNewSlightsButtonEventListener();
    });
};
