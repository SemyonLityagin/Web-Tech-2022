function createGrid(models){
    const modelsContainer = document.querySelector(".models-container")

    for(let i = 0; i < models.length; i++){
        const model = models[i]

        const card = document.createElement("div");
        card.className = "card"
        const title = document.createElement("div");
        title.textContent = model["title"]
        title.className = "title"
        card.append(title)
        const imgContainer = document.createElement("div")
        imgContainer.className = "image"
        const image = document.createElement("img");
        image.src = model["image"]
        imgContainer.append(image)
        card.append(imgContainer)
        const description = document.createElement("div");
        description.textContent = model["description"]
        description.className = "text"
        card.append(description)

        modelsContainer.append(card)
    }

    const cards = document.querySelectorAll(".card")

    for (let i = 0; i < cards.length; i++) {
        document.addEventListener("mousedown", (event) => {
            if (cards[i].contains(event.target)) {
                console.log(cards[i].querySelector(".title").textContent);
                window.location.replace("http://127.0.0.1:8000/model/"+ cards[i].querySelector(".title").textContent);
            }
        });
    }
}

fetch("models.json")
    .then((response) => response.json())
    .then((data) => createGrid(JSON.parse(data)));
