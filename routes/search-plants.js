var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET plant search */
router.get('/search-plants', function(req, res, next) {
    const query = req.query.query;
    const sparqlQuery = `
        SELECT DISTINCT ?label ?description ?thumbnail ?link WHERE {
            ?plant a dbo:Plant ;
                   rdfs:label ?label ;
                   foaf:isPrimaryTopicOf ?link .
            OPTIONAL { ?plant dbo:abstract ?description }
            OPTIONAL { ?plant dbo:thumbnail ?thumbnail }
            FILTER (langMatches(lang(?label), "EN") && regex(?label, "${query}", "i")).
            FILTER (langMatches(lang(?description), "EN"))
        } LIMIT 5`;

    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

    axios.get(url)
        .then(response => {
            const plants = response.data.results.bindings.map(bind => ({
                label: bind.label.value,
                description: bind.description ? bind.description.value.split(' ').slice(0, 20).join(' ') + '...' : 'No description available',
                thumbnail: bind.thumbnail ? bind.thumbnail.value : null,
                link: bind.link.value
            }));
            res.json(plants);
        })
        .catch(error => {
            console.error('Error querying DBpedia:', error);
            res.status(500).json({ error: 'Failed to fetch plant names' });
        });
});

module.exports = router;
