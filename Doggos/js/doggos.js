const DOG_URL = "https://dog.ceo/api/breeds/image/random";
const BREEDS_URL = "https://dog.ceo/api/breeds/list/all";

const doggos = document.querySelector(".doggos");
const loading = document.querySelector(".loading");
const breedSelect = document.querySelector(".select-breed");

// Fetch all dog breeds and populate the dropdown
fetch(BREEDS_URL)
    .then(response => response.json())
    .then(data => {
        const breeds = Object.keys(data.message);
        breeds.forEach(breed => {
            const option = document.createElement("option");
            option.value = breed;
            option.textContent = breed;
            breedSelect.appendChild(option);
        });
    });

function addNewDoggo() {
    const selectedBreed = breedSelect.value;
    const url = selectedBreed ? `https://dog.ceo/api/breed/${selectedBreed}/images/random` : DOG_URL;

    loading.style.display = "block"; // Show loading animation
    fetch(url)
        .then(response => response.json())
        .then(processedResponse => {
            const img = document.createElement("img");
            img.src = processedResponse.message;
            img.alt = "Cute doggo";
            doggos.appendChild(img);
        })
        .finally(() => {
            loading.style.display = "none"; // Hide loading animation
        });
}

document.querySelector(".add-doggo").addEventListener("click", addNewDoggo);
