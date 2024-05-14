var express = require('express');
var router = express.Router();
var plantsightings = require('../controllers/plantsightings')
var multer = require('multer');
const path = require('path');
const fs = require('fs');

// storage defines the storage options to be used for file upload with multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        // Make the file name the date + the file extension
        filename =  Date.now() + '.' + file_extension[file_extension.length-1];
        cb(null, filename);
    }
});
let upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    storage: storage
});

/* GET home page. */
router.get('/add', function(req, res, next) {
    res.render('add', { title: 'New PlantSight Form' });
});

router.post('/add-todo', upload.single('myImg'), function (req, res, next) {
    let formData = req.body;
    console.log("Form data received");
    let photoPath;

    if (req.file) {

        photoPath = req.file.path;
        console.log("File uploaded to:", photoPath);
        processFormData();
    } else if (formData.photo) {
        console.log("WEAT: formData.photo");
        const base64Data = formData.photo.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        photoPath = path.join('public/images/uploads', `photo-${Date.now()}.jpg`);

        // Ensure the directory exists
        const dir = path.dirname(photoPath);
        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory', err);
                return res.status(500).send('Error creating directory');
            }

            fs.writeFile(photoPath, buffer, function(err) {
            if (err) {
                console.error('Error saving image!', err);
                return res.status(500).send('Error saving image');
            }
            processFormData();
        });
    });
    } else {
        console.error('No image uploaded!');
        return res.status(400).send('No image uploaded');
    }

    function processFormData() {
        console.log("PROCESSING!!!");
        let result = plantsightings.create(formData, photoPath);
        console.log(result);
    }
});


module.exports = router;