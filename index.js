import { addProfile } from "./requests/POST.js";

const loginContainer = document.getElementById("login-container");
const goToRegisterLink = document.getElementById("go-to-register");
const registerContainer = document.getElementById("register-container");
const goToLoginLink = document.getElementById("go-to-login");

document
	.getElementById("new-user-form")
	.addEventListener("submit", async (event) => {
		event.preventDefault();

		const firstName = document.getElementById("first-name").value;
		const lastName = document.getElementById("last-name").value;
		const city = document.getElementById("city").value;
		const country = document.getElementById("country").value;
		const age = parseInt(document.getElementById("age").value, 10);
		const gender = document.getElementById("gender-select").value;
		const username = document.getElementById("new-username").value;
		const password = document.getElementById("new-password").value;

		const newUser = {
			firstName,
			lastName,
			city,
			country,
			age,
			gender,
			username,
			password,
		};

		try {
			await addProfile(newUser);
			alert("Bruker opprettet!");
			registerContainer.style.display = "none";
			loginContainer.style.display = "block";
		} catch (error) {
			alert("Kunne ikke opprette bruker. Prøv igjen senere.");
		}
	});

goToLoginLink.addEventListener("click", (event) => {
	event.preventDefault();
	registerContainer.style.display = "none";
	loginContainer.style.display = "block";
});

goToRegisterLink.addEventListener("click", (event) => {
	event.preventDefault();
	loginContainer.style.display = "none";
	registerContainer.style.display = "block";
});
