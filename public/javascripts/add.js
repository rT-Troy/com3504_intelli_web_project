const addNewSlightsButtonEventListener = () => {
    const nickname = document.getElementById('nickname').value;
    const dateSeen = document.getElementById('dateSeen').value;
    const location = document.getElementById('location').value;
    const height = document.getElementById('height').value;
    const description = document.getElementById('description').value;
    openSyncTodosIDB().then((db) => {
        addNewTodoToSync(db, nickname, dateSeen, location, height, description);
    });
    navigator.serviceWorker.ready
        .then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification("Todo App",
                {body: "Todo added! - " + txt_val})
                .then(r =>
                    console.log(r)
                );
        });
}

window.onload = function () {
    // Add event listeners to buttons
    const add_submit = document.getElementById("add_submit")
    add_submit.addEventListener("click", addNewSlightsButtonEventListener)
}