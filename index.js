import {} from "./requests/POST.js";
import { getUsers } from "./requests/GET.js";
import {} from "./requests/PUT.js";
import {} from "./requests/DELETE.js";

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
	if (!users || users.length === 0) {
		console.log("Ingen mulige match funnet.");
		return;
	}
	console.log(users);
	const randomIndex = Math.floor(Math.random() * users.length);
	const randomUser = users[randomIndex];
	const potentialMatch = document.getElementById("match-suggestion");
	potentialMatch.innerHTML = "";
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
