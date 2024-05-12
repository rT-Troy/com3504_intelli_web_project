const addNewTodoButtonEventListener = () => {
    const txt_val = document.getElementById("txt_in").value
    openSyncTodosIDB().then((db) => {
        addNewTodoToSync(db, txt_val);
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
    const add_btn = document.getElementById("add_btn")
    add_btn.addEventListener("click", addNewTodoButtonEventListener)
}