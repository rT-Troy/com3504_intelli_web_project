document.addEventListener('DOMContentLoaded', function() {
    var sortForm = document.getElementById('sortForm');
    var sortOrderSelect = document.getElementById('sortOrder');

    function getLocationAndSubmitForm() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var currentURL = window.location.href;

                if (!currentURL.includes('locationFetched=true')) {
                    var actionUrl = `${sortForm.getAttribute('action')}?lat=${position.coords.latitude}&long=${position.coords.longitude}&sortOrder=${sortOrderSelect.value}&locationFetched=true`;
                    window.location.href = actionUrl;
                }
            }, function(error) {
                alert("Error getting location: " + error.message);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    window.handleSortChange = function(select) {
        if (select.value === 'distance') {
            getLocationAndSubmitForm();
        } else {

            sortForm.setAttribute('action', '/');
            sortForm.submit();
        }
    };


    if (sortOrderSelect.value === 'distance' && !window.location.href.includes('locationFetched=true')) {
        getLocationAndSubmitForm();
    }
});



