var express = require('express');
var router = express.Router();
var plantsightings = require('../controllers/plantsightings')
var multer = require('multer');

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
let upload = multer({ storage: storage });

router.get('/', function(req, res, next) {
    let result = plantsightings.getAll()
    result.then(plantsightings => {
        let data = JSON.parse(plantsightings);
        // Convert dateSeen from string to Date object for each plantsighting
        data = data.map(sighting => ({
            ...sighting,
            dateSeen: new Date(sighting.dateSeen)
        }));

        console.log(data.length)
        res.render('index', { title: 'All PlantSights', data: data});
    })
});

module.exports = router;