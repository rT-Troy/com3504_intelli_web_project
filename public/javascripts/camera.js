document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var captureButton = document.getElementById('capture');

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
        uploadImage(imageData);
        $('#cameraModal').modal('hide');
    });

    // function uploadImage(imageData) {
    //     var xhr = new XMLHttpRequest();
    //     xhr.open('POST', '/upload-image', true);
    //     xhr.setRequestHeader('Content-Type', 'application/json');
    //     xhr.onload = function () {
    //         if (xhr.status === 200) {
    //             console.log('Image uploaded successfully');
    //             alert("Image uploaded successfully!");
    //         } else {
    //             console.error('Error uploading image');
    //             alert("Failed to upload image.");
    //         }
    //     };
    //     xhr.send(JSON.stringify({ image: imageData }));
    // }

    function uploadImage(imageData) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload-image', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log('Image uploaded successfully');
                document.getElementById('imageFilename').innerHTML = `<span style="color:green;">${response.filename}</span>`;
                document.getElementById('photoPath').value = response.path;
            } else {
                console.error('Error uploading image');
                alert("Failed to upload image.");
            }
        };
        xhr.send(JSON.stringify({ image: imageData }));
    }

});

