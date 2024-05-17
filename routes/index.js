var express = require('express');
var router = express.Router();
var plantsightings = require('../controllers/plantsightings')

// Define the GET route for the root URL
router.get('/', function(req, res, next) {
    plantsightings.getAll().then(plantsighting => {
        console.log(plantsighting);
        res.render('index', { title: 'Plant Sightings', plants: plantsighting });

    }).catch(err => {
        console.error(err);
        res.status(500).send("Error retrieving plant sighting.");
    });
});

router.get('/plantsightings', function(req, res, next) {
    plantsightings.getAll().then(plantsighting => {
        console.log(plantsighting);
        return res.status(200).send(plantsighting);

    }).catch(err => {
        console.error(err);
        res.status(500).send("Error retrieving plant sighting.");
    });
});


module.exports = router;

