document.addEventListener('DOMContentLoaded', function () {
    var request = indexedDB.open('MyDatabase', 2);  // Open the IndexedDB

    request.onerror = function (event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
        var db = event.target.result;
        var tx = db.transaction('nicknames', 'readonly');
        var store = tx.objectStore('nicknames');
        var getRequest = store.get('userNickname');  // Get the 'userNickname' from the store

        getRequest.onsuccess = function () {
            var storedNickname = getRequest.result ? getRequest.result.nickname : '';
            var serverNickname = document.getElementById('serverNickname').textContent.trim();  // Read the server-side injected nickname

            var localNickname = storedNickname.trim();
            console.log("Local Nickname: ", localNickname);
            console.log("Server Nickname: ", serverNickname);

            if (localNickname !== serverNickname || localNickname === '') {

                var buttonContainer = document.getElementById('buttonContainerSuggest');
                var buttonHTML = `<button type="button" class="btn btn-primary" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#inputSuggestNameModal">Suggest Identification</button>`;
                buttonContainer.innerHTML = buttonHTML;  // Insert the button into the container

            } else {

                console.log("should display button");
                var buttonContainer = document.getElementById('buttonContainerChoose');
                var buttonHTML = `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#suggestNameModal">User Suggested Names</button>`;
                buttonContainer.innerHTML = buttonHTML;  // Insert the button into the container
            }

        };

        getRequest.onerror = function (event) {
            console.error('Error fetching nickname from IndexedDB:', event.target.errorCode);
        };

        tx.oncomplete = function () {
            db.close();  // Close the db when the transaction is done
        };
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

function openPopup(imageUrl) {
    window.open(imageUrl, '_blank');
}

function successFunction(position) {

    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    document.getElementById('latitude').innerText = latitude.toFixed(6);
    document.getElementById('longitude').innerText = longitude.toFixed(6);

    initMap(latitude, longitude);
}

function initMap() {

    var latitude = parseFloat(document.getElementById('latitude').innerText);
    var longitude = parseFloat(document.getElementById('longitude').innerText);


    var center = {lat: latitude, lng: longitude};


    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: center
    });


    var marker = new google.maps.Marker({
        position: center,
        map: map
    });
}


function errorFunction(error) {
    console.error('Error Code = ' + error.code + ' - ' + error.message);
    alert('Unable to retrieve your location');
}