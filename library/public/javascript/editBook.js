function getBookInfo(form) {
    const object = {};
    const fData = new FormData(form);
    object["id"] = form.id;
    fData.forEach((value, key) => object[key] = value);
    return object;
}

function getBodyFromHtml(html) {
    const start = html.indexOf("<body>") + 6
    const end = html.lastIndexOf("</body>") - 7
    return html.substring(start,end)
}

async function putRequest(data) {
    let fetchResponse = await fetch(document.location.href, {
        method: "PUT",
        body: data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return await fetchResponse.text()
}

async function personInfoRequest(form, info) {
    const object = getBookInfo(form);
    if(document.querySelector("dialog")){
        object["state"] = "на руках"
    } else {
        object["state"] = "в наличии"
    }
    object["personCard"] = JSON.parse(info);

    const data = JSON.stringify(object);
    return await putRequest(data)
}

async function bookInfoRequest(form) {
    const object = getBookInfo(form);
    if(!document.querySelector("dialog")){
        object["state"] = "на руках"
        object["personCard"] = {name: document.querySelector(".name").textContent,
            returnDate: document.querySelector(".returnDate").textContent}
    } else {
        object["state"] = "в наличии"
        object["personCard"] = {}
    }

    const data = JSON.stringify(object);
    return await putRequest(data)
}

function offBoxShadow(){
    document.querySelector(".card").style.boxShadow = ""
}

function init(){

    const form = document.querySelector(".edit-form")
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await bookInfoRequest(form);
        document.querySelector(".card").style.boxShadow = "0px 10px 10px #33FF33"
        setTimeout(offBoxShadow,2000)
    })

    const updateButton = document.querySelector('.get');
    const favDialog = document.querySelector('.favDialog');
    if(favDialog){
        const nameInp = favDialog.querySelector('.name');
        const dateInp = favDialog.querySelector('.returnDate');
        const confirmBtn = favDialog.querySelector('.confirm');
        const cancelBtn = favDialog.querySelector('.cancel')


        updateButton.addEventListener('click', (event) => {
            if (typeof favDialog.showModal === "function") {
                favDialog.showModal();
                nameInp.setAttribute("required", "")
                dateInp.setAttribute("required", "")
            }
        });

        nameInp.addEventListener('change', (event) => {
            confirmBtn.value = JSON.stringify({"name": nameInp.value, "returnDate": dateInp.value});
        });
        dateInp.addEventListener("change", (event) => {
            confirmBtn.value = JSON.stringify({"name": nameInp.value, "returnDate": dateInp.value});
        })

        cancelBtn.addEventListener('click', (event) => {
            nameInp.removeAttribute("required");
            dateInp.removeAttribute("required");
        })

        favDialog.addEventListener('close', async (event) => {
            const author = document.getElementById("author")
            const title = document.getElementById("title")
            const year = document.getElementById("year")
            if(favDialog.returnValue !== "" && year.value !== "" && author.value !== "" && title.value !== ""){
                const html = await personInfoRequest(form, favDialog.returnValue);
                document.querySelector("body").innerHTML = getBodyFromHtml(html)

                init()
            } else {
                alert("Book don't exist")
            }
        });
    }


    const returnBtn = document.querySelector(".back")
    if(returnBtn){
        returnBtn.addEventListener('click', async (event) => {
            const html = await personInfoRequest(form, "{}");
            document.querySelector("body").innerHTML = getBodyFromHtml(html)

            init()
        })
    }
}
init()