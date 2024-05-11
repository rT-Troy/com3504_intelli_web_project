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

router.get('/', function(req, res, next) {
    let filters = {
        flowers: req.query.flowers,
        leaves: req.query.leaves,
        fruitsOrSeeds: req.query.fruitsOrSeeds,
        sunExposure: req.query.sunExposure,
        status: req.query.status,
        nickname: req.query.nickname  // Accept nickname from the query string
    };
    const sortOrder = req.query.sortOrder || 'newest';

    plantsightings.getAllFiltered(filters, sortOrder).then(plantsightings => {
        let data = plantsightings.map(sighting => ({
            ...sighting.toObject(),
            dateSeen: new Date(sighting.dateSeen)
        }));

        res.render('index', {
            title: 'All PlantSights',
            data: data,
            sortOrder: sortOrder,
            filters: filters
        });
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error retrieving plant sightings.");
    });
});



module.exports = router;

