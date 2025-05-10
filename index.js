import { addFavorite } from "./requests/POST.js";
import { getFavorites, getUsers } from "./requests/GET.js";
import { updateUserStatus } from "./requests/PUT.js";
import { deleteUser } from "./requests/DELETE.js";

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
	} else {
		document.querySelectorAll('input[name="gender"]').forEach((radio) => {
			radio.checked = false;
		});
	}

	const minAge = localStorage.getItem("minAge");
	const maxAge = localStorage.getItem("maxAge");
	if (minAge) {
		document.getElementById("min-age").value = minAge;
	} else {
		document.getElementById("min-age").value = "";
	}

	if (maxAge) {
		document.getElementById("max-age").value = maxAge;
	} else {
		document.getElementById("max-age").value = "";
	}

	showPotentialMatch();
});

function createNoButton(user, userCard, category) {
	const noButton = document.createElement("button");
	noButton.textContent = "Nei";
	noButton.classList.add("no-button");
	noButton.addEventListener("click", () => {
		deleteUser(user._id, category);
		localStorage.removeItem("currentMatch");
		userCard.remove();
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

	const selectedGender = localStorage.getItem("selectedGender");
	const minAge = parseInt(document.getElementById("min-age").value, 10);
	const maxAge = parseInt(document.getElementById("max-age").value, 10);

	if (!selectedGender || isNaN(minAge) || isNaN(maxAge)) {
		console.log("Kjønn og/eller alder er ikke definert.");
		const potentialMatch = document.getElementById("match-suggestion");
		potentialMatch.innerHTML =
			"<p>Definer kjønn og alder for å se potensielle matcher.</p>";
		return;
	}

	console.log("Valgt kjønn:", selectedGender);
	console.log("Valgt aldersgruppe:", minAge, "-", maxAge);

	let filteredUsers = users;

	filteredUsers = filteredUsers.filter(
		(user) => user.gender === selectedGender
	);
	filteredUsers = filteredUsers.filter(
		(user) => user.dob.age >= minAge && user.dob.age <= maxAge
	);

	console.log("Filtrerte brukere:", filteredUsers);
	const potentialMatch = document.getElementById("match-suggestion");
	potentialMatch.innerHTML = "";

	const savedUser = localStorage.getItem("currentMatch");
	if (savedUser) {
		const user = JSON.parse(savedUser);
		const isUserValid =
			user.gender === selectedGender &&
			user.dob.age >= minAge &&
			user.dob.age <= maxAge;

		if (isUserValid) {
			console.log("Viser lagret bruker fra localStorage.");
			const userCard = createUserCard(user);
			potentialMatch.appendChild(userCard);
			return;
		} else {
			console.log("Lagret bruker samsvarer ikke med de nye kriteriene.");
			localStorage.removeItem("currentMatch");
		}
	}

	if (filteredUsers.length === 0) {
		const noMatchMessage = document.createElement("p");
		noMatchMessage.textContent = "Ingen brukere matcher dine kriterier.";
		potentialMatch.appendChild(noMatchMessage);
		return;
	}

	const randomIndex = Math.floor(Math.random() * filteredUsers.length);
	const randomUser = filteredUsers[randomIndex];
	localStorage.setItem("currentMatch", JSON.stringify(randomUser));
	const userCard = createUserCard(randomUser);
	potentialMatch.appendChild(userCard);
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
