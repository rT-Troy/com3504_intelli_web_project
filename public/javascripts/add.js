const addNewSlightsButtonEventListener = () => {
    const nickname = document.getElementById('nickname').value;
    const dateSeen = document.getElementById('dateSeen').value;
    const description = document.getElementById('description').value;
    const height = document.getElementById('height').value;
    const spread = document.getElementById('spread').value;
    const flowers = document.getElementById('flowers').value;
    const leaves = document.getElementById('leaves').value;
    const fruitsOrSeeds = document.getElementById('fruitsOrSeeds').value;
    const sunExposure = document.getElementById('sunExposure').value;
    const photo = document.getElementById('photo').value;
    const myImg = document.getElementById('myImg').value;
    const locationString = document.getElementById('location').value;
    const coordinates = locationString.split(',').map(coord => parseFloat(coord.trim()));
    const identificationName = document.getElementById('identificationName').value;
    const location = {
        type: 'Point',
        coordinates: coordinates
    };

    const addItem = {
        nickname: nickname,
        dateSeen: dateSeen,
        location: location,
        description: description,
        photo: photo,
        photoPath: '',
        identificationName: identificationName,
        height: height,
        spread: spread,
        flowers: flowers,
        leaves: leaves,
        fruitsOrSeeds: fruitsOrSeeds,
        sunExposure: sunExposure
        // flowerColor: ''
    };

    // TODO:
    openSyncAddsIDB().then((db) => {
        addNewSlightToSync(db, addItem);
    });

    navigator.serviceWorker.ready
        .then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification("Add App", {
                body: "Add added! - " + addItem.nickname
            }).then(r => console.log(r));
        });
}

window.onload = function () {
    // Add event listeners to buttons
    const add_submit = document.getElementById("add_submit");
    add_submit.addEventListener("click", addNewSlightsButtonEventListener);
}
