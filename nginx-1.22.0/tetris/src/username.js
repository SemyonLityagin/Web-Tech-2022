const storageInfo = document.querySelector(".storage");
const button = document.querySelector(".button");
//
// storageInfo.addEventListener('input', letter => {
//     console.log(letter.target.value);
// })

document.addEventListener('keydown', event => {
    switch (event.keyCode){
        case 13:
            saveToLocalStorage();
            document.location.replace('tetris.html');
            break;
    }
});
button.addEventListener('click', event => {
    saveToLocalStorage();
})

const saveToLocalStorage = () => {
    localStorage.setItem('username', storageInfo.value);
}

const loadFromLocalStorage = () => {
    const last_username = localStorage.getItem('username');
    document.querySelector(".storage").value = last_username != null ? last_username : "";
}

loadFromLocalStorage();