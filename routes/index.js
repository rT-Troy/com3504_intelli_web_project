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
    const { sortOrder = req.query.sortOrder || 'newest', lat, long } = req.query;
    let filters = {
        flowers: req.query.flowers,
        leaves: req.query.leaves,
        fruitsOrSeeds: req.query.fruitsOrSeeds,
        sunExposure: req.query.sunExposure,
        status: req.query.status,
        nickname: req.query.nickname
    };

    // Choose to use filters only when they are set, otherwise fetch all
    if (Object.values(filters).filter(Boolean).length > 0) {
        plantsightings.getAllFiltered(filters, sortOrder).then(plantsightings => {
            let data = plantsightings.map(sighting => ({
                ...sighting.toObject(),
                dateSeen: new Date(sighting.dateSeen),
                distance: lat && long ? getDistanceFromLatLonInKm(lat, long, sighting.location.coordinates[1], sighting.location.coordinates[0]) : null
            }));

            if (sortOrder === 'distance' && lat && long) {
                data.sort((a, b) => a.distance - b.distance);
            } else if (sortOrder === 'oldest') {
                data.sort((a, b) => a.dateSeen - b.dateSeen);
            } else {
                data.sort((a, b) => b.dateSeen - a.dateSeen);
            }

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
    } else {
        // If no specific filters are used, retrieve all entries
        plantsightings.getAll().then(plantsightings => {
            let data = plantsightings.map(sighting => ({
                ...sighting.toObject(),
                dateSeen: new Date(sighting.dateSeen),
                distance: lat && long ? getDistanceFromLatLonInKm(lat, long, sighting.location.coordinates[1], sighting.location.coordinates[0]) : null
            }));

            if (sortOrder === 'distance' && lat && long) {
                data.sort((a, b) => a.distance - b.distance);
            } else if (sortOrder === 'oldest') {
                data.sort((a, b) => a.dateSeen - b.dateSeen);
            } else {
                data.sort((a, b) => b.dateSeen - a.dateSeen);
            }

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
    }
});




function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

router.get('/plantsightings', function (req, res, next) {
    plantsightings.getAll().then(adds => {
        console.log(adds);
        return res.status(200).send(adds);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
})

module.exports = router;

