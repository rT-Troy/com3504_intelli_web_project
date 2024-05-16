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

function openPopup(imageUrl) {
    window.open(imageUrl, '_blank');
}

// JavaScript function to handle form submission
function submitSuggestForm(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the value of the suggested name input field
    const newName = document.getElementById('suggestedName').value;

    // Check if the new name is provided
    if (!newName) {
        // Display the notification message
        const notification = document.getElementById('notification');
        notification.textContent = 'Please provide a suggested name.';
        notification.style.display = 'block';
    } else {
        // If the name is provided, submit the form
        document.getElementById('suggestNameForm').submit();
    }
}

// Add event listener to the form submit button
document.getElementById('submitSuggestBtn').addEventListener('click', submitSuggestForm);
