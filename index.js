// === IMPORT ===

import { addFavorite } from "./requests/POST.js";
import { getFavorites, getUsers } from "./requests/GET.js";
import { updateUserStatus } from "./requests/PUT.js";
import { deleteUser } from "./requests/DELETE.js";

// === BRUKERKORT ===

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

function createNoButton(user, userCard, category) {
	const noButton = document.createElement("button");
	noButton.textContent = "Nei";
	noButton.classList.add("no-button");
	noButton.addEventListener("click", async () => {
		try {
			await deleteUser(user._id, category);
			userCard.remove();
			if (category === "users") {
				localStorage.removeItem("currentMatch");
				showPotentialMatch();
			}
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

// === BRUKERPROFIL ===

// === POTENSIELL MATCH ===

function populateAgeRangeDropdown() {
	const ageRangeSelect = document.getElementById("age-range");
	ageRangeSelect.innerHTML = "";

	const defaultOption = document.createElement("option");
	defaultOption.value = "";
	defaultOption.disabled = true;
	defaultOption.selected = true;
	defaultOption.textContent = "Aldersintervall";
	ageRangeSelect.appendChild(defaultOption);

	const ageRanges = [
		{ min: 20, max: 29 },
		{ min: 30, max: 39 },
		{ min: 40, max: 49 },
		{ min: 50, max: 59 },
		{ min: 60, max: 69 },
		{ min: 70, max: 79 },
		{ min: 80, max: 89 },
		{ min: 90, max: 99 },
	];
	ageRanges.forEach((range) => {
		const option = document.createElement("option");
		option.value = `${range.min}-${range.max}`;
		option.textContent = `${range.min}-${range.max}`;
		ageRangeSelect.appendChild(option);
	});
	const savedAgeRange = localStorage.getItem("ageRange");
	if (savedAgeRange) {
		ageRangeSelect.value = savedAgeRange;
	}
}

function handleFilters() {
	const genderRadios = document.querySelectorAll('input[name="gender"]');
	const selectedGender = localStorage.getItem("selectedGender") || "";
	genderRadios.forEach((radio) => {
		radio.checked = radio.value === selectedGender;
		radio.addEventListener("change", (event) => {
			localStorage.setItem("selectedGender", event.target.value);
			showPotentialMatch();
		});
	});

	const ageRangeSelect = document.getElementById("age-range");
	const ageRange = localStorage.getItem("ageRange") || "";
	if (ageRange) {
		ageRangeSelect.value = ageRange;
	}
	ageRangeSelect.addEventListener("change", (event) => {
		localStorage.setItem("ageRange", event.target.value);
	});
}

async function showPotentialMatch() {
	const users = await getUsers();
	console.log("Alle brukere:", users);

	const potentialMatch = document.getElementById("match-suggestion");
	if (!users || users.length === 0) {
		potentialMatch.innerHTML = "<p>Ingen brukere tilgjengelig.</p>";
		return;
	}

	const selectedGender = localStorage.getItem("selectedGender");
	const ageRange = localStorage.getItem("ageRange");

	if (!selectedGender || !ageRange) {
		potentialMatch.innerHTML =
			"<p>Definer kjønn og alder for å se potensielle matcher.</p>";
		return;
	}

	const [minAge, maxAge] = ageRange.split("-").map(Number);
	const filteredUsers = users.filter(
		(user) =>
			user.gender === selectedGender &&
			user.dob.age >= minAge &&
			user.dob.age <= maxAge
	);
	if (filteredUsers.length === 0) {
		potentialMatch.innerHTML =
			"<p>Ingen brukere matcher dine kriterier.</p>";
		return;
	}

	const savedUserJSON = localStorage.getItem("currentMatch");
	if (savedUserJSON) {
		const savedUser = JSON.parse(savedUserJSON);
		if (filteredUsers.some((user) => user._id === savedUser._id)) {
			potentialMatch.innerHTML = "";
			const userCard = createUserCard(savedUser);
			potentialMatch.appendChild(userCard);
			return;
		} else {
			localStorage.removeItem("currentMatch");
		}
	}

	const randomUser =
		filteredUsers[Math.floor(Math.random() * filteredUsers.length)];

	localStorage.setItem("currentMatch", JSON.stringify(randomUser));
	potentialMatch.innerHTML = "";
	const userCard = createUserCard(randomUser);
	potentialMatch.appendChild(userCard);
}

// === FAVORITTER ===

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

// === INIT ===

window.addEventListener("DOMContentLoaded", () => {
	populateAgeRangeDropdown();
	handleFilters();
	showFavorites();
	document.getElementById("apply-filter").addEventListener("click", () => {
		showPotentialMatch();
	});
});
