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


router.get('/display/:id', function(req, res, next) {
    const id = req.params.id;

    plantsightings.getOne(id).then(plantsighting => {
        if (plantsighting) {

            plantsighting.dateSeen = new Date(plantsighting.dateSeen);

            res.render('display', {
                title: 'Plant Sighting Details',
                plantsighting: plantsighting
            });
        } else {

            res.status(404).send('Plant sighting not found');
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error retrieving plant sighting.");
    });
});

router.get('/display/:id/edit', function(req, res, next) {
    const id = req.params.id;

    plantsightings.getOne(id).then(plantsighting => {
        if (!plantsighting) {
            return res.status(404).send('Plant sighting not found');
        }

        res.render('edit', {
            title: 'Edit Plant Sighting',
            plantsighting: plantsighting
        });
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error retrieving plant sighting for edit.");
    });
});


router.post('/display/:id/update', upload.single('myImg'), function(req, res, next) {
    const id = req.params.id;
    const updatedData = {
        dateSeen: req.body.dateSeen,
        description: req.body.description,
        plantSize: {
            height: req.body.height,
            spread: req.body.spread,
        },
        plantCharacteristics: {
            flowers: req.body.flowers === 'on',
            leaves: req.body.leaves === 'on',
            fruitsOrSeeds: req.body.fruitsOrSeeds === 'on',
            sunExposure: req.body.sunExposure,
            flowerColor: req.body.flowerColor,
        },
        identification: {
            status: req.body.identificationStatus,
        },
        nickname: req.body.nickname,

    };


    if(req.body.location) {
        const coordinates = req.body.location.split(',').map(Number);
        updatedData.location = {
            type: "Point",
            coordinates: coordinates,
        };
    }


    if(req.file) {
        const adjustedPhotoPath = req.file.path.replace(/\\/g, '/').replace('public/', '');
        updatedData.photo = adjustedPhotoPath;
    }

    plantsightings.updateOne(id, updatedData).then(() => {
        res.redirect('/display/' + id); // Successful update redirects to plant observation record details page
    }).catch(err => {
        console.error(err);
        res.status(500).send("Error updating plant sighting.");
    });
});

module.exports = router;