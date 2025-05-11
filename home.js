// === IMPORT ===

import { addFavorite } from "./requests/POST.js";
import { getFavorites, getUsers, getProfile } from "./requests/GET.js";
import { updateProfile } from "./requests/PUT.js";
import { deleteUser } from "./requests/DELETE.js";
import { toBase64, resizeImage } from "./requests/utils.js";

// === BRUKERKORT ===

function createUserCard(user, category = "users") {
	console.log("Oppretter brukerens kort for:", user);
	const userCard = document.createElement("div");
	userCard.classList.add("user-card");

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
		const deleteButton = createDeleteButton(user, userCard, "users");
		const yesButton = createYesButton(user, userCard);
		userCard.appendChild(deleteButton);
		userCard.appendChild(yesButton);
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

function createYesButton(user, userCard) {
	const yesButton = document.createElement("button");
	yesButton.textContent = "Ja";
	yesButton.classList.add("yes-button");
	yesButton.addEventListener("click", async () => {
		try {
			await addFavorite(user);
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
	const ageRange = localStorage.getItem("ageRange") || "";
	if (ageRange) {
		ageRangeSelect.value = ageRange;
	}
	ageRangeSelect.addEventListener("change", (event) => {
		console.log("Aldersintervall valgt:", event.target.value);
		localStorage.setItem("ageRange", event.target.value);
		showPotentialMatch();
	});
}

// === POTENSIELL MATCH === //

async function showPotentialMatch() {
	const users = await getUsers();
	console.log("Alle brukere hentet fra randomuser.me:", users);

	const potentialMatch = document.getElementById("match-suggestion");
	if (!users || users.length === 0) {
		potentialMatch.innerHTML = "<p>Ingen brukere tilgjengelig.</p>";
		return;
	}
	const selectedGender = localStorage.getItem("selectedGender");
	if (!selectedGender) {
		potentialMatch.innerHTML =
			"<p>Velg et kjønn for å se potensielle matcher.</p>";
		return;
	}
	const ageRange = localStorage.getItem("ageRange");
	if (!ageRange) {
		potentialMatch.innerHTML =
			"<p>Velg et aldersintervall for å se potensielle matcher.</p>";
		return;
	}

	const [minAge, maxAge] = ageRange.split("-").map(Number);
	console.log("Min alder:", minAge);
	console.log("Max alder:", maxAge);

	const filteredUsers = users.filter(
		(user) =>
			user.gender === selectedGender &&
			user.dob.age >= minAge &&
			user.dob.age <= maxAge
	);
	console.log("Filtrerte brukere:", filteredUsers);

	if (filteredUsers.length === 0) {
		potentialMatch.innerHTML =
			"<p>Ingen brukere matcher dine kriterier.</p>";
		return;
	}

	const randomUser =
		filteredUsers[Math.floor(Math.random() * filteredUsers.length)];
	console.log("Valgt match:", randomUser);

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

window.addEventListener("DOMContentLoaded", async () => {
	try {
		const loggedInProfile = await getProfile();
		if (!loggedInProfile) {
			throw new Error("Ingen bruker er logget inn.");
		}
		showProfile();
		populateAgeRangeDropdown();
		handleFilters();
		showPotentialMatch();
		showFavorites();
	} catch (error) {
		alert("Du må være logget inn for å få tilgang til denne siden.");
		window.location.href = "index.html";
	}
});
