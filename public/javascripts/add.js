document.addEventListener('DOMContentLoaded', function () {
    var db; // Declare db at a higher scope
    var request = indexedDB.open('MyDatabase', 2);

    request.onupgradeneeded = function (event) {
        var db = event.target.result; // Assign db on upgrade or creation
        if (!db.objectStoreNames.contains('nicknames')) {
            db.createObjectStore('nicknames', {keyPath: 'id'});
        }
    };

    request.onerror = function (event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
        db = event.target.result; // Also assign db on successful opening
        var tx = db.transaction('nicknames', 'readonly');
        var store = tx.objectStore('nicknames');
        var getReq = store.get('userNickname');  // Retrieve the nickname from IndexedDB

        getReq.onsuccess = function () {
            var nicknameInput = document.getElementById('nickname');
            if (getReq.result) {
                nicknameInput.value = getReq.result.nickname;
            } else {
                console.log('No nickname found in IndexedDB.');
            }
            nicknameInput.disabled = false;  // Enable input to ensure it is included in form submission
        };

        getReq.onerror = function (event) {
            console.error('Error fetching nickname from IndexedDB:', event.target.errorCode);
        };

        tx.oncomplete = function () {
            setupFormListener(db);
        };
    };
});

function setupFormListener(db) {
    var form = document.querySelector('form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var nickname = document.getElementById('nickname').value;

        if (nickname) {
            var writeTx = db.transaction('nicknames', 'readwrite');
            var writeStore = writeTx.objectStore('nicknames');
            writeStore.put({id: 'userNickname', nickname: nickname});

            writeTx.oncomplete = function () {
                console.log('Nickname saved to IndexedDB.');
                document.getElementById('nickname').disabled = false; // Ensure it's enabled before submission
                db.close(); // Close the db only after all operations, including the write, are complete
                form.submit(); // Now submit the form programmatically
            };

            writeTx.onerror = function (event) {
                console.error('Error saving nickname to IndexedDB:', event.target.errorCode);
            };
        } else {
            // If the nickname is empty, submit the form directly
            db.close(); // Ensure to close db even if not writing anything
            form.submit();
        }
    });
}
async function addTodo() {
    const nicknameElement = document.getElementById('nickname');
    const dateSeenElement = document.getElementById('dateSeen');
    const descriptionElement = document.getElementById('description');
    const heightElement = document.getElementById('height');
    const spreadElement = document.getElementById('spread');
    const flowersElement = document.getElementById('flowers');
    const leavesElement = document.getElementById('leaves');
    const fruitsOrSeedsElement = document.getElementById('fruitsOrSeeds');
    const sunExposureElement = document.getElementById('sunExposure');
    const locationElement = document.getElementById('location');
    const identificationNameElement = document.getElementById('identificationName');
    const flowerColorElement = document.getElementById('flowerColor');
    const imgElement = document.getElementById('photo');

    if (!nicknameElement || !dateSeenElement || !descriptionElement || !heightElement || !spreadElement ||
        !flowersElement || !leavesElement || !fruitsOrSeedsElement || !sunExposureElement ||
        !locationElement || !identificationNameElement) {
        console.error('One or more form elements are missing');
        return;
    }

    console.log(imgElement.value);
    const formData = new FormData();
    const fileInput = document.querySelector('input[type="file"]');

    let addItem;

    if (fileInput && fileInput.files.length > 0) {
        const base64File = await fileToBase64(fileInput.files[0]);
        formData.append('photo', base64File);
        addItem = {
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
            flowerColor: flowerColorElement.value,
            photo: base64File,
            photoPath: ''
        };
    } else {
        formData.append('photo', imgElement.value);
        addItem = {
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
            flowerColor: flowerColorElement.value,
            photo: imgElement.value,
            photoPath: ''
        };
    }

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
    formData.append('flowerColor', flowerColorElement.value);

    try {
        const db = await openSyncAddsIDB();
        await addNewSlightToSync(db, addItem);
        console.log(addItem.toString())
        console.log('Data stored in IndexedDB for offline use.');
    } catch (error) {
        console.error('Failed to store data in IndexedDB:', error);
        console.error(formData);
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-tag');
        console.log('Background Sync Successful registration');
    } catch (err) {
        console.log('Background Sync registration failure', err);
    }

}


window.onload = function () {
    const add_submit = document.getElementById("add_submit");
    add_submit.addEventListener("click", addTodo);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

