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
        console.log("image data:", imageData.substr(0, 100));
        document.getElementById('photo').value = imageData;
        console.log("Image data has been stored in hidden fields")

        var imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = imageData;
            imagePreview.style.display = 'block';
        }

        document.getElementById('status').textContent = 'The image has been captured';
        document.getElementById('status').style.color = 'green';
        $('#cameraModal').modal('hide');
    });



    $('#cameraModal').on('hide.bs.modal', function () {
        var tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    });
});

