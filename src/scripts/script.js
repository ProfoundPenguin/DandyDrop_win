function dropHandler(event) {

}

function dragEnter(event) {
    document.querySelector('#drop_files').classList.add('ondrag')
}

function dragLeave(event) {
    document.querySelector('#drop_files').classList.remove('ondrag')
}