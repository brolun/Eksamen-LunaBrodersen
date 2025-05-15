// === IMPORT === //

import { addFavorite } from "./requests/POST.js";
import { getFavorites, getUsers, getProfile } from "./requests/GET.js";
import { updateProfile, updateFavorite } from "./requests/PUT.js";
import { deleteUser } from "./requests/DELETE.js";
import { resizeImage } from "./requests/utils.js";

// === BRUKERKORT === //

function createUserCard(user, category = "users") {
	console.log("Oppretter brukerens kort for:", user.name, category);
	const userCard = document.createElement("div");
	userCard.classList.add("usercard");

	if (category === "favorites" && user.matched !== "") {
		userCard.classList.add(
			user.matched === "true" ? "matched" : "not-matched"
		);
	}

	let profilePicture;
	if (category === "profiles") {
		profilePicture =
			user.profilePicture || "./assets/portrait-placeholder.png";
	} else if (category === "users" || category === "favorites") {
		profilePicture =
			user.picture?.large || "./assets/portrait-placeholder.png";
	}

	userCard.innerHTML = `
<div class="status-indicator ${
		user.matched === "true"
			? "matched-symbol"
			: user.matched === "false"
			? "not-matched-symbol"
			: ""
	}">
        ${user.matched === "true" ? "❤" : user.matched === "false" ? "✖" : ""}
    </div>
    <img src="${profilePicture}" alt="Profilbilde">
    <div class="user-info">
        <h3>${user.firstName || user.name.first} ${
		user.lastName || user.name.last
	}, ${user.age || user.dob.age}</h3>
        <p>${user.city || user.location.city}, ${
		user.country || user.location.country
	}</p>
        <div class="usercard-buttons">
            <!-- Knappene legges til dynamisk her -->
        </div>
    </div>
`;

	const buttonContainer = userCard.querySelector(".usercard-buttons");

	if (category === "profiles") {
		const editButton = createEditButton(user, userCard);
		const logoutButton = createLogoutButton(user);
		const deleteButton = createDeleteButton(user, userCard, "profiles");
		buttonContainer.appendChild(editButton);
		buttonContainer.appendChild(logoutButton);
		buttonContainer.appendChild(deleteButton);
	}
	if (category === "users") {
		const nextMatchButton = createNextMatchButton(userCard);
		const favoriteButton = createFavoriteButton(user, userCard);
		buttonContainer.appendChild(nextMatchButton);
		buttonContainer.appendChild(favoriteButton);
	}
	if (category === "favorites") {
		const deleteButton = createDeleteButton(user, userCard, "favorites");
		buttonContainer.appendChild(deleteButton);
		if (user.matched === "true") {
			const messageButton = createMessageButton(user);
			buttonContainer.appendChild(messageButton);
		}
	}
	return userCard;
}

// === KNAPPER === //

function createEditButton(user) {
	const editButton = document.createElement("button");
	editButton.textContent = "Rediger";
	editButton.classList.add("edit-button");

	editButton.addEventListener("click", () => {
		const profileContainer = document.getElementById("profile");
		const editContainer = document.getElementById("edit-profile-container");
		const editForm = document.getElementById("edit-profile-form");

		profileContainer.style.display = "none";
		editContainer.style.display = "block";

		populateEditForm(user);
		handleProfilePicturePreview(user);

		editForm.onsubmit = async (event) => {
			event.preventDefault();
			await handleFormSubmit(user, editContainer, profileContainer);
		};
		document.getElementById("cancel-edit").addEventListener("click", () => {
			editContainer.style.display = "none";
			profileContainer.style.display = "block";
		});
	});
	return editButton;
}

function createLogoutButton() {
	const logoutButton = document.createElement("button");
	logoutButton.textContent = "Logg ut";
	logoutButton.classList.add("logout-button");
	logoutButton.addEventListener("click", () => {
		localStorage.removeItem("loggedInUser");
		window.location.href = "index.html";
	});
	return logoutButton;
}

function createDeleteButton(user, userCard, category) {
	const deleteButton = document.createElement("button");
	deleteButton.textContent = category === "profiles" ? "Slett profil" : "✖";
	deleteButton.classList.add("delete-button");
	if (category === "profiles") {
		deleteButton.classList.add("delete-profile-button");
	} else if (category === "favorites") {
		deleteButton.classList.add("delete-favorite-button");
	}
	deleteButton.addEventListener("click", async () => {
		try {
			if (category === "profiles") {
				const confirmDelete = confirm(
					"Er du sikker på at du vil slette profilen din? Dette kan ikke angres."
				);
				if (!confirmDelete) return;
				await deleteUser(user._id, "profiles");
				localStorage.removeItem("loggedInUser");
				alert("Profilen din er slettet.");
				window.location.href = "index.html";
			} else {
				await deleteUser(user._id, category);
				userCard.remove();
				if (category === "users") {
					localStorage.removeItem("currentMatch");
					showPotentialMatch();
				}
			}
		} catch (error) {
			console.error(`Klarte ikke å slette bruker fra ${category}`, error);
		}
	});
	return deleteButton;
}

function createNextMatchButton(userCard) {
	const nextMatchButton = document.createElement("button");
	nextMatchButton.textContent = "✖";
	nextMatchButton.classList.add("next-match-button");
	nextMatchButton.addEventListener("click", async () => {
		try {
			userCard.remove();
			localStorage.removeItem("currentMatch");
			await showPotentialMatch();
		} catch (error) {
			console.error("Klarte ikke å vise neste match", error);
		}
	});
	return nextMatchButton;
}

function createFavoriteButton(user, userCard) {
	const favoriteButton = document.createElement("button");
	favoriteButton.textContent = "❤";
	favoriteButton.classList.add("yes-button");
	favoriteButton.addEventListener("click", async () => {
		try {
			await addFavorite(user);
			userCard.remove();
			localStorage.removeItem("currentMatch");
			showFavorites();
			showPotentialMatch();

			const favorites = await getFavorites();
			if (favorites && favorites.length > 0) {
				const newestFavorite = favorites[favorites.length - 1];
				const favoriteList = document.getElementById("favorites");
				console.log("Kaller notifyOfMutualMatch for:", newestFavorite);
				notifyOfMutualMatch(newestFavorite, favoriteList);
			} else {
				console.warn("Ingen favoritter funnet etter oppdatering.");
			}
		} catch (error) {
			console.error(
				"Klarte ikke å flytte brukeren til favoritter",
				error
			);
		}
	});
	return favoriteButton;
}

// === BRUKERPROFIL === //

async function showProfile() {
	try {
		const loggedInProfile = await getProfile();
		if (!loggedInProfile) {
			return;
		}
		const profileContainer = document.getElementById("profile-container");
		if (!profileContainer) {
			return;
		}
		const userCard = createUserCard(loggedInProfile, "profiles");
		profileContainer.innerHTML = "";
		profileContainer.appendChild(userCard);
	} catch (error) {
		console.error("Klarte ikke å vise profilen", error);
	}
}

// === REDIGERINGSSKJEMA === //

function populateEditForm(user) {
	document.getElementById("edit-first-name").value = user.firstName;
	document.getElementById("edit-last-name").value = user.lastName;
	document.getElementById("edit-city").value = user.city;
	document.getElementById("edit-country").value = user.country;
	document.getElementById("edit-age").value = user.age;
	document.getElementById("edit-gender").value = user.gender;
	document.getElementById("edit-username").value = user.username;
	document.getElementById("edit-password").value = "";
}

function handleProfilePicturePreview(user) {
	const profilePicturePreview = document.getElementById(
		"edit-profile-picture-preview"
	);
	const profilePictureInput = document.getElementById("edit-profile-picture");
	if (user.profilePicture && !user.profilePicture.startsWith("data:image/")) {
		profilePicturePreview.src = `data:image/jpeg;base64,${user.profilePicture}`;
	} else {
		profilePicturePreview.src =
			user.profilePicture || "./assets/portrait-placeholder.png";
	}
	profilePictureInput.addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (file) {
			profilePicturePreview.src = "";
			profilePicturePreview.style.display = "none";
		}
	});
}

async function handleFormSubmit(user, editContainer, profileContainer) {
	const updatedData = {
		firstName: document.getElementById("edit-first-name").value,
		lastName: document.getElementById("edit-last-name").value,
		city: document.getElementById("edit-city").value,
		country: document.getElementById("edit-country").value,
		age: parseInt(document.getElementById("edit-age").value, 10),
		gender: document.getElementById("edit-gender").value,
		username: document.getElementById("edit-username").value,
	};
	const newPassword = document.getElementById("edit-password").value;
	updatedData.password = newPassword ? newPassword : user.password;
	const profilePictureFile = document.getElementById("edit-profile-picture")
		.files[0];
	if (profilePictureFile) {
		updatedData.profilePicture = await resizeImage(
			profilePictureFile,
			800,
			800
		);
	} else {
		updatedData.profilePicture = user.profilePicture;
	}
	try {
		await updateProfile(user._id, updatedData);
		Object.assign(user, updatedData);
		editContainer.style.display = "none";
		profileContainer.style.display = "block";
		showProfile();
		alert("Din brukerprofil ble oppdatert!");
	} catch (error) {
		alert("Din brukerprofil kunne ikke oppdateres. Prøv igjen senere.");
	}
}

// === FILTRERING === //

function handleFilters() {
	const genderSelect = document.getElementById("gender-select");
	const selectedGender = localStorage.getItem("selectedGender") || "";
	genderSelect.value = selectedGender;
	genderSelect.addEventListener("change", (event) => {
		console.log("Kjønn valgt:", event.target.value);
		localStorage.setItem("selectedGender", event.target.value);
		localStorage.removeItem("currentMatch");
		showPotentialMatch();
	});

	const ageRangeSelect = document.getElementById("age-range");
	const savedAgeRange = localStorage.getItem("ageRange") || "";
	ageRangeSelect.value = savedAgeRange;
	ageRangeSelect.addEventListener("change", (event) => {
		console.log("Aldersintervall valgt:", event.target.value);
		localStorage.setItem("ageRange", event.target.value);
		localStorage.removeItem("currentMatch");
		showPotentialMatch();
	});
}

// === POTENSIELL MATCH === //

async function showPotentialMatch() {
	try {
		const potentialMatch = document.getElementById("match-suggestion");
		const justLoggedIn = localStorage.getItem("justLoggedIn");
		if (justLoggedIn === "true") {
			console.log("Brukeren logget nettopp inn. Genererer ny match.");
			localStorage.removeItem("currentMatch");
			localStorage.removeItem("justLoggedIn");
		}

		const savedMatch = localStorage.getItem("currentMatch");
		if (savedMatch) {
			console.log("Viser lagret match fra localStorage.");
			const randomUser = JSON.parse(savedMatch);
			potentialMatch.innerHTML = "";
			const userCard = createUserCard(randomUser);
			potentialMatch.appendChild(userCard);
			return;
		}

		const users = await getUsers();
		if (!users || users.length === 0) {
			potentialMatch.innerHTML = `<p>Ingen brukere funnet. Ta deg en tur på byen heller.</p>`;
			return;
		}

		const selectedGender = localStorage.getItem("selectedGender");
		const ageRange = localStorage.getItem("ageRange");

		if (selectedGender === null || ageRange === null) {
			potentialMatch.innerHTML = `<p>Velg kjønn og aldersintervall for å se potensielle matcher.</p>`;
			return;
		}

		let filteredUsers = users;
		if (selectedGender !== "whatever") {
			filteredUsers = filteredUsers.filter(
				(user) => user.gender === selectedGender
			);
		}
		if (ageRange !== "whatever") {
			const [minAge, maxAge] = ageRange.split("-").map(Number);
			filteredUsers = filteredUsers.filter(
				(user) => user.dob.age >= minAge && user.dob.age <= maxAge
			);
		}
		if (filteredUsers.length === 0) {
			potentialMatch.innerHTML = `<p>Ingen brukere matcher dine kriterier. Er du kanskje litt kresen?</p>`;
			return;
		}

		const randomUser =
			filteredUsers[Math.floor(Math.random() * filteredUsers.length)];
		console.log("Valgt match:", randomUser);
		localStorage.setItem("currentMatch", JSON.stringify(randomUser));
		potentialMatch.innerHTML = "";
		const userCard = createUserCard(randomUser);
		potentialMatch.appendChild(userCard);
	} catch (error) {
		console.error("Feil i showPotentialMatch:", error);
	}
}

// === FAVORITTER === //

async function showFavorites() {
	try {
		const favorites = await getFavorites();
		if (!favorites || favorites.length === 0) {
			const favoriteList = document.getElementById("favorites-container");
			favoriteList.innerHTML =
				"<p>Ingen favoritter funnet. Er du kanskje litt kresen?</p>";
			return;
		}
		const favoriteList = document.getElementById("favorites");
		favoriteList.innerHTML = "";
		favorites.reverse().forEach((user) => {
			const userCard = createUserCard(user, "favorites");
			favoriteList.appendChild(userCard);
		});
	} catch (error) {
		console.error("Feil med funksjonen showFavorites:", error);
	}
}

// === TILLEGGSFUNKSJONER === //

function notifyOfMutualMatch(favorite, favoriteList) {
	const randomDelay = Math.floor(Math.random() * 10000) + 5000;
	setTimeout(async () => {
		try {
			const favoriteCard = Array.from(favoriteList.children).find(
				(card) =>
					card
						.querySelector("h3")
						.textContent.includes(favorite.name.first)
			);
			if (!favoriteCard) {
				return;
			}
			const hasMatched = Math.random() < 0.5;

			alert(
				hasMatched
					? `🎉 ${favorite.name.first} ${favorite.name.last} har også matchet med deg!`
					: `😢 ${favorite.name.first} ${favorite.name.last} har dessverre ikke matchet med deg.`
			);
			const statusIndicator =
				favoriteCard.querySelector(".status-indicator");
			if (hasMatched) {
				statusIndicator.textContent = "❤";
				statusIndicator.classList.remove("not-matched-symbol");
				statusIndicator.classList.add("matched-symbol");
			} else {
				statusIndicator.textContent = "✖";
				statusIndicator.classList.remove("matched-symbol");
				statusIndicator.classList.add("not-matched-symbol");
			}
			favoriteCard.classList.add(hasMatched ? "matched" : "not-matched");
			const updatedFavorite = {
				...favorite,
				matched: hasMatched ? "true" : "false",
			};
			const favoriteId = updatedFavorite._id;
			delete updatedFavorite._id;
			await updateFavorite(favoriteId, updatedFavorite);
			if (hasMatched) {
				const buttonContainer =
					favoriteCard.querySelector(".usercard-buttons");
				const messageButton = createMessageButton(favorite);
				buttonContainer.appendChild(messageButton);
			}
			console.log(
				`Matched-status oppdatert for ${favorite.name.first} ${favorite.name.last}:`,
				hasMatched ? "true" : "false"
			);
		} catch (error) {
			console.error("Feil ved oppdatering av matched-status:", error);
		}
	}, randomDelay);
}
// 🗩/🗨/✉ chat button for mutual match

function createMessageButton(user) {
	const messageButton = document.createElement("button");
	messageButton.textContent = "🗨";
	messageButton.classList.add("message-button");
	messageButton.addEventListener("click", () => {
		const message = prompt(
			`Skriv en melding til ${user.firstName || user.name.first}:`
		);
		if (message) {
			alert(
				`Meldingen din til ${
					user.firstName || user.name.first
				} har blitt sendt!`
			);
			console.log(
				`Melding sendt til ${
					user.firstName || user.name.first
				}: ${message}`
			);
		} else {
			alert("Meldingen ble ikke sendt.");
		}
	});
	return messageButton;
}

// === INIT === //

// window.addEventListener("DOMContentLoaded", async () => {
// 	try {
// 		const loggedInProfile = await getProfile();
// 		if (!loggedInProfile) {
// 			throw new Error("Ingen bruker er logget inn.");
// 		}
// 		showProfile();
// 		handleFilters();
// 		showPotentialMatch();
// 		showFavorites();
// 	} catch (error) {
// 		alert("Du må være logget inn for å få tilgang til denne siden.");
// 		window.location.href = "index.html";
// 	}
// });

showProfile();
handleFilters();
showPotentialMatch();
showFavorites();
