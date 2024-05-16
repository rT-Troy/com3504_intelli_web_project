var express = require('express');
var router = express.Router();
var axios = require('axios');

// Route to handle GET requests for plant search
router.get('/search-plants', function(req, res, next) {
    // Extract the query parameter from the request
    const query = req.query.query;

    // Define the SPARQL query to search for plants in DBpedia
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

    // Encode the SPARQL query and construct the URL
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

    // Make a GET request to the DBpedia SPARQL endpoint
    axios.get(url)
        .then(response => {
            // Map the response data to extract relevant information
            const plants = response.data.results.bindings.map(bind => ({
                label: bind.label.value,
                description: bind.description ? bind.description.value.split(' ').slice(0, 20).join(' ') + '...' : 'No description available',
                thumbnail: bind.thumbnail ? bind.thumbnail.value : null,
                link: bind.link.value
            }));

            // Send the extracted information as JSON response
            res.json(plants);
        })
        .catch(error => {
            // Log any errors and send a 500 status code with error message
            console.error('Error querying DBpedia:', error);
            res.status(500).json({ error: 'Failed to fetch plant names' });
        });
});

// Export the router to be used in other parts of the application
module.exports = router;
