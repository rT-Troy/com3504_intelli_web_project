document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snapButton = document.getElementById('snap');
    var fileInput = document.getElementById('myImg');
    var hiddenInput = document.getElementById('photo');
    var imagePreview = document.getElementById('imagePreview');


    fileInput.addEventListener('change', function() {

        if (hiddenInput.value) {
            hiddenInput.value = "";
            imagePreview.style.display = 'none';
            imagePreview.src = '';
            document.getElementById('status').textContent = '';
        }
    });

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
        handleCameraCapture(imageData);
    });


    window.handleCameraCapture = function(base64Data) {

        hiddenInput.value = base64Data;
        imagePreview.src = base64Data;
        imagePreview.style.display = 'block';
        document.getElementById('status').textContent = 'Image captured';
        document.getElementById('status').style.color = 'green';


        fileInput.value = "";


        $('#cameraModal').modal('hide');
    };

    $('#cameraModal').on('hide.bs.modal', function () {
        var tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    });
});

