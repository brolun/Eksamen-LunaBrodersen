import { addFavorite } from "./requests/POST.js";
import { getFavorites, getUsers } from "./requests/GET.js";
import { updateUserStatus } from "./requests/PUT.js";
import { deleteUser } from "./requests/DELETE.js";

document.getElementById("apply-filter").addEventListener("click", () => {
	const selectedGender = document.querySelector(
		'input[name="gender"]:checked'
	)?.value;
	const minAge = document.getElementById("min-age").value;
	const maxAge = document.getElementById("max-age").value;
	setFilters(selectedGender, minAge, maxAge);
	showPotentialMatch();
});

window.addEventListener("DOMContentLoaded", () => {
	initializeFilters();
	showPotentialMatch();
	showFavorites();
});

function setFilters(selectedGender, minAge, maxAge) {
	if (selectedGender) {
		localStorage.setItem("selectedGender", selectedGender);
	}
	if (minAge) {
		localStorage.setItem("minAge", minAge);
	}
	if (maxAge) {
		localStorage.setItem("maxAge", maxAge);
	}
}

function initializeFilters() {
	const { selectedGender, minAge, maxAge } = getFilters();
	if (selectedGender) {
		const genderRadio = document.querySelector(
			`input[name="gender"][value="${selectedGender}"]`
		);
		if (genderRadio) {
			genderRadio.checked = true;
		}
	} else {
		document.querySelectorAll('input[name="gender"]').forEach((radio) => {
			radio.checked = false;
		});
	}
	document.getElementById("min-age").value = minAge || "";
	document.getElementById("max-age").value = maxAge || "";
}

function getFilters() {
	const selectedGender = localStorage.getItem("selectedGender");
	const minAge = parseInt(localStorage.getItem("minAge"), 10);
	const maxAge = parseInt(localStorage.getItem("maxAge"), 10);
	return { selectedGender, minAge, maxAge };
}

function createNoButton(user, userCard, category) {
	const noButton = document.createElement("button");
	noButton.textContent = "Nei";
	noButton.classList.add("no-button");
	noButton.addEventListener("click", async () => {
		try {
			await deleteUser(user._id, category);
			userCard.remove();
			localStorage.removeItem("currentMatch");
			showPotentialMatch();
		} catch (error) {
			console.error(`Klarte ikke å slette bruker fra ${category}`, error);
		}
	});
	return noButton;
}
function createYesButton(user, userCard) {
	const yesButton = document.createElement("button");
	yesButton.textContent = "Ja";
	yesButton.classList.add("yes-button");
	yesButton.addEventListener("click", async () => {
		try {
			await addFavorite(user);
			await deleteUser(user._id, "users");
			userCard.remove();
			localStorage.removeItem("currentMatch");
			showFavorites();
			showPotentialMatch();
		} catch (error) {
			console.error(
				"Klarte ikke å flytte brukeren til favoritter",
				error
			);
		}
	});
	return yesButton;
}

function createUserCard(user, category = "users") {
	const userCard = document.createElement("div");
	userCard.classList.add("user-card");
	userCard.innerHTML = `
        <img src="${user.picture.large}" alt="Profilbilde">
        <h3>${user.name.first} ${user.name.last}</h3>
        <p>${user.dob.age} år</p>
        <p>${user.location.city}, ${user.location.country}</p>`;

	if (category === "users") {
		const noButton = createNoButton(user, userCard, "users");
		const yesButton = createYesButton(user, userCard);
		userCard.appendChild(noButton);
		userCard.appendChild(yesButton);
	}

	if (category === "favorites") {
		const noButton = createNoButton(user, userCard, "favorites");
		userCard.appendChild(noButton);
	}

	return userCard;
}

async function showPotentialMatch() {
	const users = await getUsers();
	console.log("Alle brukere:", users);
	if (!users || users.length === 0) {
		console.log("Ingen mulige match funnet.");
		return;
	}

	const { selectedGender, minAge, maxAge } = getFilters();

	if (!validateFilters(selectedGender, minAge, maxAge)) {
		displayMessage("Definer kjønn og alder for å se potensielle matcher.");
		return;
	}

	let filteredUsers = filterUsers(users, selectedGender, minAge, maxAge);

	const savedUser = getSavedUser();
	if (savedUser && isUserValid(savedUser, selectedGender, minAge, maxAge)) {
		displayUser(savedUser);
		return;
	} else {
		clearSavedUser();
	}

	if (filteredUsers.length === 0) {
		displayMessage("Ingen brukere matcher dine kriterier.");
		return;
	}

	const randomUser = selectRandomUser(filteredUsers);
	saveUser(randomUser);
	displayUser(randomUser);
}

// Funksjon for å validere filtrene
function validateFilters(selectedGender, minAge, maxAge) {
	return selectedGender && !isNaN(minAge) && !isNaN(maxAge);
}

// Funksjon for å filtrere brukere basert på kjønn og alder
function filterUsers(users, selectedGender, minAge, maxAge) {
	return users
		.filter((user) => user.gender === selectedGender)
		.filter((user) => user.dob.age >= minAge && user.dob.age <= maxAge);
}

// Funksjoner for å håndtere lagret bruker
function getSavedUser() {
	const savedUser = localStorage.getItem("currentMatch");
	return savedUser ? JSON.parse(savedUser) : null;
}

function isUserValid(user, selectedGender, minAge, maxAge) {
	return (
		user.gender === selectedGender &&
		user.dob.age >= minAge &&
		user.dob.age <= maxAge
	);
}

function clearSavedUser() {
	localStorage.removeItem("currentMatch");
}

// Funksjoner for å velge og lagre bruker
function selectRandomUser(users) {
	const randomIndex = Math.floor(Math.random() * users.length);
	return users[randomIndex];
}

function saveUser(user) {
	localStorage.setItem("currentMatch", JSON.stringify(user));
}

// Funksjoner for å vise bruker eller melding i UI
function displayUser(user) {
	const potentialMatch = document.getElementById("match-suggestion");
	potentialMatch.innerHTML = "";
	const userCard = createUserCard(user);
	potentialMatch.appendChild(userCard);
}

function displayMessage(message) {
	const potentialMatch = document.getElementById("match-suggestion");
	potentialMatch.innerHTML = `<p>${message}</p>`;
}

async function showFavorites() {
	const favorites = await getFavorites();
	if (!favorites || favorites.length === 0) {
		console.log("Ingen favoritter funnet.");
		const favoriteList = document.getElementById("favorites");
		favoriteList.innerHTML = "<p>Ingen favoritter funnet.</p>";
		return;
	}
	console.log("Favoritter:", favorites);
	const favoriteList = document.getElementById("favorites");
	favoriteList.innerHTML = "";
	favorites.forEach((user) => {
		const userCard = createUserCard(user, "favorites");
		favoriteList.appendChild(userCard);
	});
}

showPotentialMatch();
showFavorites();
