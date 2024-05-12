var express = require('express');
var router = express.Router();
var multer = require('multer');

// Middleware for handling multipart/form-data, which is primarily used for uploading files.
// Since the example given doesn't seem to handle file uploads, you might not need multer here unless other parts of your application require it.
var upload = multer();

// Route to display the nickname form
router.get('/nickname', function(req, res) {
    res.render('nickname'); // Render 'nickname.ejs' view file
});

// Handling form submission
router.post('/nickname', upload.none(), function(req, res) {
    // Here, you can process any server-side logic if needed.
    // For instance, if you want to log the received nickname or handle it in some way:
    console.log("Nickname received:", req.body.nickname);

    // Since the actual storage is handled by IndexedDB on the client-side,
    // you might not need to do any storage here but can perform other actions as needed.

    // After processing, redirect or send a response
    res.redirect('/'); // Redirect to the home page or to another page confirming the save.
    // Alternatively, you can send a response like:
    // res.send('Nickname received!');
});

module.exports = router;
