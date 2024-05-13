    var express = require('express');
    var router = express.Router();
    var plantsightings = require('../controllers/plantsightings')
    var multer = require('multer');
    const plantsightingModel = require("../models/plantsightings");

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
            if (!plantsighting) {
                res.status(404).send('Plant sighting not found');
                return; // Exit the function after sending the response
            }

            // Adjust the dateSeen property to be a Date object
            plantsighting.dateSeen = new Date(plantsighting.dateSeen);


            // Prepare variables for the render function
            const title = plantsighting.identification.status === 'in-progress' ?
                "In progress (suggest a name)" :
                plantsighting.identification.name;

            // Render the template with the prepared variables
            res.render('display', {
                title: title,
                plantsighting: plantsighting,
            });

        }).catch(err => {
            console.error(err);
            res.status(500).send("Error retrieving plant sighting.");
        });
    });

    router.post('/display/:id/add-suggest-name', upload.none(), function(req, res) {
        console.log("Received body: ", req.body); // This will log the body of the request

        const id = req.params.id;
        const newName = req.body.suggestedName;

        if (!newName) {
            console.error("No new name provided");
            return res.status(400).send("No new name provided");
        }

        plantsightings.addSuggestName(id, newName).then((updatedDocument) => {
            console.log("Updated document: ", updatedDocument);
            res.redirect('/display/' + id);
        }).catch(err => {
            console.error("Error in addSuggestName:", err);
            res.status(500).send("Error adding suggested name.");
        });
    });


    router.get('/suggest-nicknames/:id', function(req, res) {
        plantControllers.getSuggestions(req.params.id).then(suggestions => {
            res.json(suggestions);
        }).catch(err => {
            console.error("Error: ", err.message);
            res.status(500).send(err.message);
        });
    });

    router.post('/display/:id/update-name', function(req, res) {
        const id = req.params.id;
        const newName = req.body.selectedName;

        if (!newName || newName === "No suggested names available") {
            return res.status(400).send("Invalid name selected.");
        }

        plantsightings.updateIdentificationName(id, newName)
            .then(updatedDocument => {
                res.redirect('/display/' + id); // Redirect back to the detailed view
            })
            .catch(err => {
                res.status(500).send("Error updating name: " + err.message);
            });
    });

    module.exports = router;