var express = require('express');
var router = express.Router();
var multer = require('multer');

var upload = multer();

// Route to display the nickname form
router.get('/nickname', function(req, res) {
    res.render('nickname'); // Render 'nickname.ejs' view file
});

// Handling form submission
router.post('/nickname', upload.none(), function(req, res) {
    console.log("Nickname received:", req.body.nickname);

    res.redirect('/'); // Redirect to the home page or to another page confirming the save.
});

module.exports = router;
