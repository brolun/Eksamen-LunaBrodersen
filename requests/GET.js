import { crudUrl, randomUserUrl } from "./auth.js";

async function getUsers() {
	try {
		console.log("Henter brukere fra randomuser.me ...");
		const response = await fetch(randomUserUrl);
		if (!response.ok) {
			throw new Error("HTTP-feil! Status:", response.status);
		}
		const data = await response.json();
		console.log("Brukere hentet fra randomuser.me:", data.results);
		return data.results;
	} catch (error) {
		console.error("Klarte ikke å hente brukere fra randomuser.me:", error);
		return [];
	}
}

async function getFavorites() {
	try {
		console.log("Henter favoritter fra CrudCrud ...");
		const response = await fetch(`${crudUrl}/favorites`);
		if (!response.ok) {
			throw new Error("HTTP-feil! Status:", response.status);
		}
		const data = await response.json();
		console.log("Favoritter hentet fra CrudCrud:", data);
		return data;
	} catch (error) {
		console.error("Klarte ikke å hente favoritter fra CrudCrud:", error);
		return [];
	}
}

async function getProfile({ username, password } = {}) {
	try {
		console.log("Henter profiler fra CrudCrud ...");
		const response = await fetch(`${crudUrl}/profiles`);
		if (!response.ok) {
			throw new Error("HTTP-feil! Status:", response.status);
		}
		const profiles = await response.json();
		let profile;
		if (username && password) {
			profile = profiles.find(
				(profile) =>
					profile.username === username &&
					profile.password === password
			);
			if (!profile) {
				throw new Error("Feil brukernavn eller passord!");
			}
			const currentProfileId = sessionStorage.getItem("profileId");
			if (currentProfileId !== profile._id) {
				console.log(
					"Ny profil oppdaget. Resetter filtreringskriterier."
				);
				localStorage.removeItem("selectedGender");
				localStorage.removeItem("ageRange");
			}
			localStorage.setItem("justLoggedIn", true);
			sessionStorage.setItem("profileId", profile._id);
			console.log(
				"Innlogget profil lagret i sessionStorage med brukernavn:",
				profile.username
			);
		} else {
			const profileId = sessionStorage.getItem("profileId");
			profile = profiles.find((profile) => profile._id === profileId);
			if (!profile) {
				throw new Error("Innlogget profil ikke funnet");
			}
			console.log(
				"Innlogget profil hentet fra sessionStorage med brukernavn:",
				profile.username
			);
		}
		return profile;
	} catch (error) {
		console.error("Klarte ikke å hente profil fra CrudCrud:", error);
		throw error;
	}
}

export { getUsers, getFavorites, getProfile };
