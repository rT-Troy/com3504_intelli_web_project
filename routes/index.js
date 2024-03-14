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
router.get('/', function(req, res, next) {
  res.render('index', { title: 'New PlantSight Form' });
});

router.get('/display', function(req, res, next) {
  let result = plantsightings.getAll()
  result.then(plantsightings => {
    let data = JSON.parse(plantsightings);
    // Convert dateSeen from string to Date object for each plantsighting
    data = data.map(sighting => ({
      ...sighting,
      dateSeen: new Date(sighting.dateSeen)
    }));

    console.log(data.length)
    res.render('display', { title: 'View All PlantSights', data: data});
  })
});

router.post('/add', upload.single('myImg'), function (req, res, next) {
  if (!req.file) {
    console.error('No file uploaded with the request!');
    return res.sendStatus(400); // Bad request error code
  }

  let formData = req.body;
  let photoPath = req.file.path;
  let result = plantsightings.create(formData, photoPath);
  console.log(result);
  res.redirect('/');
});

module.exports = router;
