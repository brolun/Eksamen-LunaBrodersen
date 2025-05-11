// === IMPORT ===

import { addFavorite } from "./requests/POST.js";
import { getFavorites, getUsers, getProfile } from "./requests/GET.js";
import { updateProfile } from "./requests/PUT.js";
import { deleteUser } from "./requests/DELETE.js";
import { resizeImage } from "./requests/utils.js";

// === BRUKERKORT ===

function createUserCard(user, category = "users") {
	console.log("Oppretter brukerens kort for:", user);
	const userCard = document.createElement("div");
	userCard.classList.add("user-card");

	if (category === "favorites" && user.hasMatched !== undefined) {
		userCard.classList.add(user.hasMatched ? "matched" : "not-matched");
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
  		<img src="${profilePicture}" alt="Profilbilde">
        <h3>${user.firstName || user.name.first} ${
		user.lastName || user.name.last
	}</h3>
        <p>${user.age || user.dob.age} år</p>
        <p>${user.city || user.location.city}, ${
		user.country || user.location.country
	}</p>`;

	if (category === "profiles") {
		const editButton = createEditButton(user, userCard);
		const logoutButton = createLogoutButton(user);
		const deleteButton = createDeleteButton(user, userCard, "profiles");
		userCard.appendChild(editButton);
		userCard.appendChild(logoutButton);
		userCard.appendChild(deleteButton);
	}
	if (category === "users") {
		const nextMatchButton = createNextMatchButton(userCard);
		const favoriteButton = createFavoriteButton(user, userCard);
		userCard.appendChild(nextMatchButton);
		userCard.appendChild(favoriteButton);
	}
	if (category === "favorites") {
		const deleteButton = createDeleteButton(user, userCard, "favorites");
		userCard.appendChild(deleteButton);
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
	deleteButton.textContent = category === "profiles" ? "Slett profil" : "Nei";
	deleteButton.classList.add("delete-button");
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
	nextMatchButton.textContent = "Nei";
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
	favoriteButton.textContent = "Ja";
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
				const favoriteCard = createUserCard(
					newestFavorite,
					"favorites"
				);
				document.getElementById("favorites").appendChild(favoriteCard);
				notifyOfMutualMatch(newestFavorite, favoriteCard);
			} else {
				console.error("Ingen favoritter funnet etter opprettelse.");
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

// === BRUKERPROFIL ===

async function showProfile() {
	try {
		const loggedInProfile = await getProfile();
		console.log("Innlogget profil:", loggedInProfile);
		if (!loggedInProfile) {
			console.error("Ingen profildata funnet.");
			return;
		}
		const profileContainer = document.getElementById("profile");
		if (!profileContainer) {
			console.error("Elementet med id 'profile' finnes ikke.");
			return;
		}
		const userCard = createUserCard(loggedInProfile, "profiles");
		profileContainer.innerHTML = "";
		profileContainer.appendChild(userCard);
	} catch (error) {
		console.error("Kunne ikke hente profildata:", error);
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
			console.log("Nytt bilde valgt:", file.name);
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
	console.log("Oppdaterte data som sendes til CRUD:", updatedData);
	try {
		await updateProfile(user._id, updatedData);
		Object.assign(user, updatedData);
		editContainer.style.display = "none";
		profileContainer.style.display = "block";
		showProfile();
		alert("Profilen ble oppdatert!");
	} catch (error) {
		console.error("Klarte ikke å oppdatere profilen", error);
		alert("Kunne ikke oppdatere profilen. Prøv igjen senere.");
	}
}

// === FILTRERING === //

function handleFilters() {
	const genderSelect = document.getElementById("gender-select");
	const selectedGender = localStorage.getItem("selectedGender") || "";
	if (selectedGender) {
		genderSelect.value = selectedGender;
	}
	genderSelect.addEventListener("change", (event) => {
		console.log("Kjønn valgt:", event.target.value);
		localStorage.setItem("selectedGender", event.target.value);
		showPotentialMatch();
	});

	const ageRangeSelect = document.getElementById("age-range");
	const savedAgeRange = localStorage.getItem("ageRange") || "";
	if (savedAgeRange) {
		ageRangeSelect.value = savedAgeRange;
	}
	ageRangeSelect.addEventListener("change", (event) => {
		console.log("Aldersintervall valgt:", event.target.value);
		localStorage.setItem("ageRange", event.target.value);
		showPotentialMatch();
	});
}

// === POTENSIELL MATCH === //

async function showPotentialMatch() {
	try {
		const potentialMatch = document.getElementById("match-suggestion");

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
			potentialMatch.innerHTML = `<p>Ingen brukere tilgjengelig.</p>`;
			return;
		}

		const selectedGender = localStorage.getItem("selectedGender");
		const ageRange = localStorage.getItem("ageRange");
		if (!selectedGender || !ageRange) {
			potentialMatch.innerHTML = `<p>Velg kjønn og aldersintervall for å se potensielle matcher.</p>`;
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
			potentialMatch.innerHTML = `<p>Ingen brukere matcher dine kriterier.</p>`;
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

// === TILLEGGSFUNKSJON === //

function notifyOfMutualMatch(favorite, userCard) {
	const randomDelay = Math.floor(Math.random() * 10000) + 5000;

	setTimeout(() => {
		const hasMatched = Math.random() < 0.5;
		if (hasMatched) {
			userCard.classList.add("matched");
			userCard.classList.remove("not-matched");
			alert(
				`🎉 ${favorite.name.first} ${favorite.name.last} har også matchet med deg!`
			);
		} else {
			userCard.classList.add("not-matched");
			userCard.classList.remove("matched");
			alert(
				`😢 ${favorite.name.first} ${favorite.name.last} har dessverre ikke matchet med deg.`
			);
		}
	}, randomDelay);
}

// === INIT ===

window.addEventListener("DOMContentLoaded", async () => {
	try {
		const loggedInProfile = await getProfile();
		if (!loggedInProfile) {
			throw new Error("Ingen bruker er logget inn.");
		}
		showProfile();
		handleFilters();
		showPotentialMatch();
		showFavorites();
	} catch (error) {
		alert("Du må være logget inn for å få tilgang til denne siden.");
		window.location.href = "index.html";
	}
});
