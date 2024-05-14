var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET plant search */
router.get('/search-plants', function(req, res, next) {
    const query = req.query.query;
    const sparqlQuery = `
        SELECT DISTINCT ?label ?description WHERE {
            ?plant a dbo:Plant ;
                   rdfs:label ?label .
            OPTIONAL { ?plant dbo:abstract ?description }
            FILTER (langMatches(lang(?label), "EN") && regex(?label, "${query}", "i")).
            FILTER (langMatches(lang(?description), "EN"))
        } LIMIT 3`;

    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

    axios.get(url)
        .then(response => {
            const plants = response.data.results.bindings.map(bind => ({
                label: bind.label.value,
                description: bind.description ? bind.description.value : null
            }));
            res.json(plants);
        })
        .catch(error => {
            console.error('Error querying DBpedia:', error);
            res.status(500).json({ error: 'Failed to fetch plant names' });
        });
});

module.exports = router;
