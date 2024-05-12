document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var captureButton = document.getElementById('capture');
    var photoPathInput = document.getElementById('photoPath'); // Input for storing base64 image data

    $('#cameraModal').on('show.bs.modal', function () {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                video.srcObject = stream;
                video.play();
            }).catch(function(error) {
                console.error("Error accessing the camera: ", error);
                alert("Error accessing the camera: " + error.message);
            });
        } else {
            alert('Your browser does not support the getUserMedia API.');
        }
    });

    captureButton.addEventListener("click", function () {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imageData = canvas.toDataURL('image/png');
        // Save imageData to a hidden form input
        photoPathInput.value = imageData;
        $('#cameraModal').modal('hide');
        document.getElementById('imageFilename').innerHTML = `<span style="color:green;">Image captured. Ready to submit with the form.</span>`;
    });
});


