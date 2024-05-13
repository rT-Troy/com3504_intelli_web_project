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
                return;
            }

            // Extract keywords from the description and characteristics
            let descriptionKeywords = plantsighting.description.replace(/\W/g, ' ').split(" ").filter(word => word.length > 3);
            let color = plantsighting.plantCharacteristics.flowerColor || "";
            let sunExposure = plantsighting.plantCharacteristics.sunExposure.replace(/\s+/g, '_');

            // SPARQL endpoint and query construction
            const endpointUrl = 'https://dbpedia.org/sparql';
            let filters = descriptionKeywords.map(word => `CONTAINS(LCASE(?description), "${word.toLowerCase()}")`).join(" || ");

            const sparqlQuery = `
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dbo: <http://dbpedia.org/ontology/>
            PREFIX dbr: <http://dbpedia.org/resource/>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX dbc: <http://dbpedia.org/resource/Category:>

            SELECT ?plant ?plantLabel ?description WHERE {
              ?plant dbo:abstract ?description.
              ?plant rdfs:label ?plantLabel.
              { ?plant dbo:kingdom dbr:Plant } UNION { ?plant dct:subject dbc:Flora }
              FILTER (langMatches(lang(?description), "EN") && langMatches(lang(?plantLabel), "EN"))
              FILTER (${filters})
            } LIMIT 3
        `;

            const encodedQuery = encodeURIComponent(sparqlQuery);
            const queryUrl = `${endpointUrl}?query=${encodedQuery}&format=json`;

            fetch(queryUrl)
                .then(response => response.json())
                .then(data => {
                    let bindings = data.results.bindings;
                    res.render('display', {
                        title: plantsighting.identification.name || "In progress",
                        plantsighting: plantsighting,
                        additionalPlants: bindings
                    });
                })
                .catch(err => {
                    console.error('SPARQL query failed', err);
                    res.render('display', {
                        title: plantsighting.identification.name || "In progress",
                        plantsighting: plantsighting,
                        additionalPlants: [] // Ensure this is always defined
                    });
                });
        }).catch(err => {
            console.error(err);
            res.status(500).send("Error retrieving plant sighting.");
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