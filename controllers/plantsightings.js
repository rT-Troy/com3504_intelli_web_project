// Import the student model
const plantsightingModel = require('../models/plantsightings');

// Function to create new students
exports.create = function (formData, photoPath) {
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
        photo: photoPath,
        nickname: formData.nickname
    });

    // Save the student to the database and handle success or failure
    return plantsighting.save().then(plantsighting => {
        // Log the created student
        console.log(plantsighting);

        // Return the student data as a JSON string
        return JSON.stringify(plantsighting);
    }).catch(err => {
        // Log the error if saving fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

// Function to get all students
exports.getAll = function () {
    // Retrieve all students from the database
    return plantsightingModel.find({}).then(plantsightings => {
        // Return the list of students as a JSON string
        return JSON.stringify(plantsightings);
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

