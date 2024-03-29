var express = require('express');
var router = express.Router();
var multer = require('multer');


// Route to display the nickname form
router.get('/nickname', function(req, res) {
    res.render('nickname'); // Render 'nickname.ejs' view file
});

// Handling form submission
router.post('/nickname', function(req, res) {
    // After processing, you can redirect or send a response
    res.redirect('/'); // or res.send('Nickname saved!');
});

module.exports = router;