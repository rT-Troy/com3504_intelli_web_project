// Import the student model
const plantsightingModel = require('../models/plantsightings');

// Function to create new plantsighting
exports.create = function (formData, photoPath) {
    // Adjust the photo path to be stored in the database
    const adjustedPhotoPath = photoPath.replace(/\\/g, '/').replace('public/', '');
    // Create a new student instance using the provided user data
    let plantsighting = new plantsightingModel({
        dateSeen: formData.dateSeen,
        location: {
            type: "Point",
            coordinates: formData.location.split(',').map(Number) // Assuming formData.location is "longitude,latitude"
        },
        description: formData.description,
        plantSize: {
            height: formData.height,
            spread: formData.spread
        },
        plantCharacteristics: {
            flowers: formData.flowers === 'on',
            leaves: formData.leaves === 'on',
            fruitsOrSeeds: formData.fruitsOrSeeds === 'on',
            sunExposure: formData.sunExposure,
            flowerColor: formData.flowerColor
        },
        identification: {
            name: formData.identificationName,
            status: formData.identificationStatus,
            dbpediaUri: formData.dbpediaUri
        },
        photo: adjustedPhotoPath,
        nickname: formData.nickname
    });

    // Save the plantsightings to the database and handle success or failure
    return plantsighting.save().then(plantsighting => {
        // Log the created student
        console.log(plantsighting);

        // Return the plantsightings data as a JSON string
        return JSON.stringify(plantsighting);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};


exports.getOne = function(id) {

    return plantsightingModel.findById(id).then(plantsighting => {

        return plantsighting;
    }).catch(err => {

        console.log(err);
        return null;
    });
};


exports.getAll = function (sortOrder = 'newest') {
// Set the sort criteria, default is by latest date in descending order.
    let sortQuery = {};
    if (sortOrder === 'newest') {
        sortQuery.dateSeen = -1; // descending order
    } else if (sortOrder === 'oldest') {
        sortQuery.dateSeen = 1; // Ascending order
    }


    return plantsightingModel.find({}).sort(sortQuery).then(plantsightings => {

        return plantsightings;
    }).catch(err => {
        console.log(err);
        return null;
    });
};

exports.updateOne = function(id, updatedData) {
    return plantsightingModel.findByIdAndUpdate(id, updatedData, { new: true }).then(updatedPlantsighting => {
        console.log('Updated Plant Sighting:', updatedPlantsighting);
        return updatedPlantsighting;
    }).catch(err => {
        console.error('Error updating plant sighting:', err);
        throw err;
    });
};
