document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snapButton = document.getElementById('snap');

    function openCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(error) {
                console.error("Error accessing the camera: ", error);
                alert("Error accessing the camera: " + error.message);
            });
    }

    $('#cameraModal').on('show.bs.modal', function () {
        openCamera();
    });

    snapButton.addEventListener('click', function() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imageData = canvas.toDataURL('image/png');


        document.getElementById('photo').value = imageData;

    });


    $('#cameraModal').on('hide.bs.modal', function () {
        var tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    });
});

