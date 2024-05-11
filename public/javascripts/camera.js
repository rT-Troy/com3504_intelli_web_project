// document.getElementById('snap').addEventListener('click', function () {
//     var video = document.getElementById('video');
//     var canvas = document.getElementById('canvas');
//     var context = canvas.getContext('2d');
//     var snap = document.getElementById('snap');
//
//
//     // Trigger photo take
//     snap.addEventListener("click", function (event) {
//         event.preventDefault();  // Prevent any form submission
//         context.drawImage(video, 0, 0, canvas.width, canvas.height);
//         var data = canvas.toDataURL('image/png');
//         document.getElementById('photo').value = data;
//     });
//
//     // Get access to the camera
//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//         navigator.mediaDevices.getUserMedia({ video: true })
//             .then(function(stream) {
//                 var video = document.getElementById('video');
//                 video.srcObject = stream;
//                 video.play();
//             })
//             .catch(function(error) {
//                 console.error("Error accessing the camera: ", error);
//                 alert("Error accessing the camera: " + error.message);
//             });
//     } else {
//         alert('Your browser does not support the getUserMedia API.');
//     }
//
//
// });

document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snap = document.getElementById('snap');
    var fileInput = document.getElementById('myImg');

    // Initialize canvas with text
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText('Upload your photo', canvas.width / 2, canvas.height / 2);

    // Handle image capture from video
    snap.addEventListener("click", function () {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        var data = canvas.toDataURL('image/png');
        document.getElementById('photo').value = data;
        fileInput.value = ''; // Clear file input if photo is captured

        // Access to the camera
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

    // Handle image upload from file input
    fileInput.addEventListener('change', function (event) {
        var file = fileInput.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);
                    document.getElementById('photo').value = reader.result; // Set base64 string to hidden input
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });


});
