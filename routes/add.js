var express = require('express');
var router = express.Router();
var plantsightings = require('../controllers/plantsightings')
var multer = require('multer');
const fs = require('fs');
const path = require('path');
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

// router.post('/upload-image', function(req, res) {
//   let imageData = req.body.image;
//   if (!imageData) {
//     return res.status(400).send('No image data received');
//   }
//
//   const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
//   const buffer = Buffer.from(base64Data, 'base64');
//   const uploadsDir = path.join(__dirname, '../public/images/uploads');
//
//   // Ensure the directory exists
//   fs.mkdir(uploadsDir, { recursive: true }, (err) => {
//     if (err) {
//       return res.status(500).send('Failed to create directory');
//     }
//
//     const filename = `upload-${Date.now()}.png`;
//     const filePath = path.join(uploadsDir, filename);
//
//     fs.writeFile(filePath, buffer, function(err) {
//       if (err) {
//         console.error('Error saving image!', err);
//         return res.sendStatus(500);
//       }
//       res.send({ path: filePath });
//     });
//   });
// });

router.post('/upload-image', function(req, res) {
  let imageData = req.body.image;
  if (!imageData) {
    return res.status(400).send('No image data received');
  }

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');
  const uploadsDir = path.join(__dirname, '../public/images/uploads');

  fs.mkdir(uploadsDir, { recursive: true }, (err) => {
    if (err) {
      return res.status(500).send('Failed to create directory');
    }

    const filename = `upload-${Date.now()}.png`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFile(filePath, buffer, function(err) {
      if (err) {
        console.error('Error saving image!', err);
        return res.sendStatus(500);
      }
      res.send({ path: filePath, filename: filename });
    });
  });
});


module.exports = router;
