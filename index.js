import {} from "./requests/POST.js";
import { getUsers } from "./requests/GET.js";
import {} from "./requests/PUT.js";
import {} from "./requests/DELETE.js";

document.getElementById("apply-filter").addEventListener("click", () => {
	const selectedGender = document.querySelector(
		'input[name="gender"]:checked'
	)?.value;
	if (selectedGender) {
		localStorage.setItem("selectedGender", selectedGender);
	}
	const minAge = document.getElementById("min-age").value;
	const maxAge = document.getElementById("max-age").value;
	localStorage.setItem("minAge", minAge);
	localStorage.setItem("maxAge", maxAge);
	showPotentialMatch();
});

window.addEventListener("DOMContentLoaded", () => {
	const selectedGender = localStorage.getItem("selectedGender");
	if (selectedGender) {
		const genderRadio = document.querySelector(
			`input[name="gender"][value="${selectedGender}"]`
		);
		if (genderRadio) {
			genderRadio.checked = true;
		}
	}
	const minAge = localStorage.getItem("minAge");
	const maxAge = localStorage.getItem("maxAge");
	if (minAge) {
		document.getElementById("min-age").value = minAge;
	}
	if (maxAge) {
		document.getElementById("max-age").value = maxAge;
	}
	showPotentialMatch();
});

function createUserCard(user) {
	const userCard = document.createElement("div");
	userCard.classList.add("user-card");
	userCard.innerHTML = `
        <img src="${user.picture.large}" alt="Profilbilde">
        <h3>${user.name.first} ${user.name.last}</h3>
        <p>${user.dob.age} år</p>
        <p>${user.location.city}, ${user.location.country}</p>
        <button>Nei</button>
        <button>Ja</button>`;
	return userCard;
}

async function showPotentialMatch() {
	const users = await getUsers();
	console.log("Alle brukere:", users);
	if (!users || users.length === 0) {
		console.log("Ingen mulige match funnet.");
		return;
	}

	const selectedGender = document.querySelector(
		'input[name="gender"]:checked'
	)?.value;
	const minAge = parseInt(document.getElementById("min-age").value, 10);
	const maxAge = parseInt(document.getElementById("max-age").value, 10);

	console.log("Valgt kjønn:", selectedGender);
	console.log("Valgt aldersgruppe:", minAge, "-", maxAge);

	let filteredUsers = users;

	if (selectedGender) {
		filteredUsers = filteredUsers.filter(
			(user) => user.gender === selectedGender
		);
	}

	if (!isNaN(minAge) && !isNaN(maxAge)) {
		filteredUsers = filteredUsers.filter(
			(user) => user.dob.age >= minAge && user.dob.age <= maxAge
		);
	}

	console.log("Filtrerte brukere:", filteredUsers);
	const potentialMatch = document.getElementById("match-suggestion");
	potentialMatch.innerHTML = "";

	if (filteredUsers.length === 0) {
		const noMatchMessage = document.createElement("p");
		noMatchMessage.textContent = "Ingen brukere matcher dine kriterier.";
		potentialMatch.appendChild(noMatchMessage);
		return;
	}

	const randomIndex = Math.floor(Math.random() * filteredUsers.length);
	const randomUser = filteredUsers[randomIndex];
	const userCard = createUserCard(randomUser);
	potentialMatch.appendChild(userCard);
}

async function showFavorites() {
	const users = await getUsers();
	if (!users || users.length === 0) {
		console.log("Ingen favoritter funnet.");
		return;
	}
	console.log(users);
	const favoriteList = document.getElementById("favorites");
	favoriteList.innerHTML = "";
	users.forEach((user) => {
		const userCard = createUserCard(user);
		favoriteList.appendChild(userCard);
	});
}

showPotentialMatch();
showFavorites();
