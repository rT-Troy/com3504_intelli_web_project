document.getElementById('snap').addEventListener('click', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snap = document.getElementById('snap');

    // Trigger photo take
    snap.addEventListener("click", function (event) {
        event.preventDefault();  // Prevent any form submission
        context.drawImage(video, 0, 0, 320, 240);
        var data = canvas.toDataURL('image/png');
        document.getElementById('photo').value = data;
    });

    // Get access to the camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                var video = document.getElementById('video');
                video.srcObject = stream;
                video.play();
            })
            .catch(function(error) {
                console.error("Error accessing the camera: ", error);
                alert("Error accessing the camera: " + error.message);
            });
    } else {
        alert('Your browser does not support the getUserMedia API.');
    }


});

