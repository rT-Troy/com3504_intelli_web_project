// Import the student model
const plantsightingModel = require('../models/plantsightings');

// Function to create new plantsighting
exports.create = function (formData, photoPath) {
    // Adjust the photo path to be stored in the database
    const adjustedPhotoPath = photoPath.replace(/\\/g, '/').replace('public/', '');
    const name = formData.identificationName.trim();  // Ensure to trim to remove any accidental whitespace

    // Adjust the identification status based on the presence of the name
    const status = name ? 'completed' : 'in-progress';
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
            name: name,
            status: status,
            dbpediaUri: formData.dbpediaUri
        },
        photo: adjustedPhotoPath,
        nickname: formData.nickname
    });

    // Save the plantsightings to the database and handle success or failure
    return plantsighting.save().then(plantsighting => {

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

exports.getSuggestions = function(id) {
    return plantsightingModel.findById(id).then(plantsighting => {
        if (!plantsighting) {
            throw new Error('No plant sighting found with the given ID');
        }
        // Check if the suggest_nickname array exists and return it
        if (plantsighting.suggest_nickname && plantsighting.suggest_nickname.length > 0) {
            return plantsighting.suggest_nickname;
        } else {
            // If there are no suggestions, return a default value or an empty array
            return [];
        }
    }).catch(err => {
        console.log(err);
        return []; // Return an empty array in case of an error
    });
};

// // Function to get all plant sightings with optional filters and sorting
// exports.getAllFiltered = function(filters = {}, sortOrder = 'newest') {
//     let sortQuery = sortOrder === 'newest' ? { dateSeen: -1 } : { dateSeen: 1 };
//     let query = {};
//
//     // Apply filters to the query object if provided
//     if (filters.flowers) query['plantCharacteristics.flowers'] = filters.flowers === 'true';
//     if (filters.leaves) query['plantCharacteristics.leaves'] = filters.leaves === 'true';
//     if (filters.fruitsOrSeeds) query['plantCharacteristics.fruitsOrSeeds'] = filters.fruitsOrSeeds === 'true';
//     if (filters.sunExposure) query['plantCharacteristics.sunExposure'] = filters.sunExposure;
//     if (filters.status) query['identification.status'] = filters.status;
//     if (filters.nickname) query['nickname'] = filters.nickname;  // Filter by nickname if provided
//
//     // Perform the query on the plantsightingModel, sort the results, and return them
//     return plantsightingModel.find(query).sort(sortQuery).then(plantsightings => {
//         return plantsightings;
//     }).catch(err => {
//         console.error(err);
//         return null;
//     });
// };

// Function to get all plant sightings without any filters or sorting
exports.getAll = function() {
    // Perform a query to find all documents in the plantsightingModel collection
    return plantsightingModel.find({}).then(plantsightings => {
        return plantsightings;
    }).catch(err => {
        console.error(err);
        return [];
    });
};

exports.addSuggestName = function(id, name) {
    return plantsightingModel.findByIdAndUpdate(id, {
        $push: { suggest_name: name }
    }, { new: true }).then(updatedDocument => {
        return updatedDocument;
    }).catch(err => {
        console.error('Error updating plant sighting with new suggested name:', err);
        throw err;
    });
};

exports.updateIdentificationName = function(id, newName) {
    return plantsightingModel.findByIdAndUpdate(id, {
        'identification.name': newName,
        'identification.status': 'completed' // Update status if necessary
    }, { new: true }).then(updatedDocument => {
        if (!updatedDocument) {
            throw new Error('No document found with the given ID');
        }
        return updatedDocument;
    }).catch(err => {
        console.error('Error updating plant sighting name:', err);
        throw err;
    });
};
