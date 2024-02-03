// // When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

var isMaximized = false;

function handleWindowControls() {
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        console.log("minizing");
        api.min()
    });

    document.getElementById('max-button').addEventListener("click", event => {
        console.log("Maximizing");
        isMaximized = true
        toggleMaxRestoreButtons()
        api.max()
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        console.log("unmaximizing");
        isMaximized = false
        toggleMaxRestoreButtons()
        api.unmax()
    });

    document.getElementById('close-button').addEventListener("click", event => {
        console.log("Closing");
        api.close()
    });

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();

    function toggleMaxRestoreButtons() {
        if (isMaximized) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}



function dropHandler(event, adding = false) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    for (const file of files) {
        api.shareFile([file.path, file.name, file.size]).then(data => {
            if (data) {
                if(!adding) {
                    window.location.href = "sharing.html";
                }
                else {
                    api.getSharingFiles().then(data => {
                        all_files = ""
                        data.forEach(file => {
                            all_files += formatFileDetails(file);
                        });
                        document.querySelector("#files_list").innerHTML = all_files
                        if(data.length == 0) {
                            document.querySelector("#files").classList.add("no_files")
                        } else {
                            document.querySelector("#files").classList.remove("no_files")
                        }
                    })
                }
            }
        })
       
    }

    document.querySelector('#drop_files').classList.remove('ondrag')
}

function dragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    document.querySelector('#drop_files').classList.add('ondrag')
}

function dragLeave(event) {
    document.querySelector('#drop_files').classList.remove('ondrag')
}

function dragOver(event) {
    event.preventDefault();
    event.stopPropagation();
}