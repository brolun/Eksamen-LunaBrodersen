// === IMPORT === //

import { addProfile } from "./requests/POST.js";
import { getProfiles } from "./requests/GET.js";

// === VARIABLER === //

const loginContainer = document.getElementById("login-container");
const goToRegisterLink = document.getElementById("go-to-register");
const registerContainer = document.getElementById("register-container");
const goToLoginLink = document.getElementById("go-to-login");

// === REGISTRERING === //

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

// === INNLOGGING === //

document
	.getElementById("login-form")
	.addEventListener("submit", async (event) => {
		event.preventDefault();

		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		try {
			const profiles = await getProfiles();
			const matchingProfile = profiles.find(
				(profile) =>
					profile.username === username &&
					profile.password === password
			);
			if (matchingProfile) {
				alert("Innlogging vellykket!");
				localStorage.setItem(
					"loggedInUser",
					JSON.stringify(matchingProfile)
				);
				window.location.href = "home.html";
			} else {
				alert("Feil brukernavn eller passord!");
			}
		} catch (error) {
			alert("Kunne ikke logge inn. Prøv igjen senere.");
		}
	});

goToRegisterLink.addEventListener("click", (event) => {
	event.preventDefault();
	loginContainer.style.display = "none";
	registerContainer.style.display = "block";
});
