import {} from "./requests/POST.js";
import { getUsers } from "./requests/GET.js";
import {} from "./requests/PUT.js";
import {} from "./requests/DELETE.js";

function createUserCard(user) {
	const userCard = document.createElement("li");
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

async function showUsers() {
	const users = await getUsers();
	if (!users || users.length === 0) {
		console.log("Ingen brukere funnet.");
		return;
	}
	console.log(users);

	const userList = document.getElementById("user-list");
	userList.innerHTML = "";

	users.forEach((user) => {
		const userCard = createUserCard(user);
		userList.appendChild(userCard);
	});
}

showUsers();
