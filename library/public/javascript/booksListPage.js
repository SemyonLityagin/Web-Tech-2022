function deleteBtnClick(id) {
    console.log(id)
    const favDialog = document.querySelector('.favDialog');
    if (typeof favDialog.showModal === "function") {
        favDialog.id = id
        favDialog.showModal();
    }
}

async function booksFilter(select) {
    const state = select.options[select.selectedIndex].text
    const fetchResponse = await fetch(document.location.href, {
        method: "PUT",
        body: JSON.stringify({"state": state}),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const html = await fetchResponse.text()
    document.querySelector("body").innerHTML = getBodyFromHtml(html)
}

function getBodyFromHtml(html) {
    const start = html.indexOf("<body>") + 6
    const end = html.lastIndexOf("</body>") - 7
    return html.substring(start,end)
}

async function deleteRequest(id) {
    let fetchResponse = await fetch(document.location.href, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"id": id})
    });

    return await fetchResponse.text();
}

const favDialog = document.querySelector('.favDialog');
if (favDialog) {
    favDialog.addEventListener('close', async (event,) => {
        if (favDialog.returnValue !== "") {
            const html = await deleteRequest(favDialog.id)
            favDialog.id = ""
            document.querySelector("body").innerHTML = getBodyFromHtml(html)
        }
    });
}