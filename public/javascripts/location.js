document.getElementById('getLocation').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

function successFunction(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    document.getElementById('location').value = `${longitude}, ${latitude}`;
}

function errorFunction(error) {
    console.error('Error Code = ' + error.code + ' - ' + error.message);
    alert('Unable to retrieve your location');
}




