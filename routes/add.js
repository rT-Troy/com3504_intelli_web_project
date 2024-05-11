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

/* GET home page. */
router.get('/add', function(req, res, next) {
  res.render('add', { title: 'New PlantSight Form' });
});

// router.post('/add', upload.single('myImg'), function (req, res, next) {
//   if (!req.file) {
//     console.error('No file uploaded with the request!');
//     return res.sendStatus(400); // Bad request error code
//   }
//
//   let formData = req.body;
//   let photoPath = req.file.path;
//   let result = plantsightings.create(formData, photoPath);
//   console.log(result);
//   res.redirect('/add');
// });
router.post('/add', upload.single('myImg'), function (req, res, next) {
  let photoData = req.body.photo;

  if (!photoData) {
    console.error('No photo data received!');
    return res.sendStatus(400);
  }

  // Extract base64 part
  const base64Data = photoData.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');

  // Save the image
  require('fs').writeFile('public/images/uploads/' + Date.now() + '.png', buffer, function(err) {
    if (err) {
      console.error('Error saving image!', err);
      return res.sendStatus(500);
    }
    let formData = req.body;
    let photoPath = req.file.path;
    let result = plantsightings.create(formData, photoPath);
    console.log(result);
    res.redirect('/');
  });
});

module.exports = router;
