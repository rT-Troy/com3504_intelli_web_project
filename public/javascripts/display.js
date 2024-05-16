// Checks the user's nickname and displays buttons for name suggestion or selection accordingly
document.addEventListener('DOMContentLoaded', function () {
    var request = indexedDB.open('MyDatabase', 2);  // Open the IndexedDB

    request.onerror = function (event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
        var db = event.target.result;
        var tx = db.transaction('nicknames', 'readonly');
        var store = tx.objectStore('nicknames');
        var getRequest = store.get('userNickname');  // Get the 'userNickname' from the store

        getRequest.onsuccess = function () {
            var storedNickname = getRequest.result ? getRequest.result.nickname : '';
            var serverNickname = document.getElementById('serverNickname').textContent.trim();  // Read the server-side injected nickname

            var localNickname = storedNickname.trim();
            console.log("Local Nickname: ", localNickname);
            console.log("Server Nickname: ", serverNickname);

            if (localNickname !== serverNickname || localNickname === '') {

                var buttonContainer = document.getElementById('buttonContainerSuggest');
                var buttonHTML = `<button type="button" class="btn btn-primary" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#inputSuggestNameModal">Suggest Identification</button>`;
                buttonContainer.innerHTML = buttonHTML;  // Insert the button into the container

            } else {

                console.log("should display button");
                var buttonContainer = document.getElementById('buttonContainerChoose');
                var buttonHTML = `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#suggestNameModal">User Suggested Names</button>`;
                buttonContainer.innerHTML = buttonHTML;  // Insert the button into the container
            }

        };

        getRequest.onerror = function (event) {
            console.error('Error fetching nickname from IndexedDB:', event.target.errorCode);
        };

        tx.oncomplete = function () {
            db.close();  // Close the db when the transaction is done
        };
    };
});

// Opens the full image in a new tab
function openPopup(imageUrl) {
    window.open(imageUrl, '_blank');
}

// Function to search for plants using the DBpedia API
function searchPlants() {
    const query = document.getElementById('plantSearch').value; // Get the query from the input field
    if (query.length < 3) return; // Only search if the query length is 3 or more to reduce requests

    // Make a GET request to the search-plants endpoint with the query
    axios.get(`/search-plants?query=${encodeURIComponent(query)}`)
        .then(function (response) {
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = ''; // Clear previous results

            // Iterate over the response data to create and append plant result elements
            response.data.forEach(plant => {
                const plantDiv = document.createElement('div');
                plantDiv.className = 'plant-result card';
                plantDiv.innerHTML = `
                        <div class="row g-0">
                            <div class="col-auto">
                                <img src="${plant.thumbnail || '/images/default-plant.png'}" class="img-fluid rounded-start" alt="${plant.label}">
                            </div>
                            <div class="col">
                                <div class="card-body">
                                    <h5 class="card-title">${plant.label}</h5>
                                    <p class="card-text">${plant.description}</p>
                                    <a href="${plant.link}" class="btn btn-primary" target="_blank">Learn More</a>
                                </div>
                            </div>
                        </div>`;
                // Set the suggestedName input value when a plant result is clicked
                plantDiv.onclick = function() {
                    document.getElementById('suggestedName').value = plant.label;
                };
                searchResults.appendChild(plantDiv); // Append the plant result to the search results
            });
        })
        .catch(function (error) {
            console.error('Error fetching plant names:', error); // Log the error
        });
}

// JavaScript function to handle name suggestion form submission
function submitSuggestForm(event) {
    event.preventDefault();

    // Get the value of the suggested name input field
    const newName = document.getElementById('suggestedName').value;

    // Check if the new name is provided
    if (!newName) {
        // Alerts the user that they need to suggest a name
        const notification = document.getElementById('notification');
        notification.textContent = 'Please provide a suggested name.';
        notification.style.display = 'block';
    } else {
        document.getElementById('suggestNameForm').submit();
    }
}

// Add event listener to the name suggestion form submit button
document.getElementById('submitSuggestBtn').addEventListener('click', submitSuggestForm);
