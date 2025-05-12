import { crudUrl, randomUserUrl } from "./auth.js";

async function getUsers() {
	try {
		const response = await fetch(randomUserUrl);
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		const data = await response.json();
		console.log("Brukere hentet fra randomuser.me:", data.results);
		return data.results;
	} catch (error) {
		console.error("Feil ved henting av brukere fra randomuser.me:", error);
		return [];
	}
}

async function getFavorites() {
	try {
		const response = await fetch(`${crudUrl}/favorites`);
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		const data = await response.json();
		console.log(data);
		return data;
	} catch (error) {
		console.error("Klarte ikke å hente favoritter", error);
		return [];
	}
}

async function getProfile({ username, password } = {}) {
	try {
		let profile = JSON.parse(sessionStorage.getItem("loggedInProfile"));
		if (profile) {
			console.log("Henter profil fra sessionStorage:", profile);
			return profile;
		}
		const response = await fetch(`${crudUrl}/profiles`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const profiles = await response.json();

		if (username && password) {
			profile = profiles.find(
				(profile) =>
					profile.username === username &&
					profile.password === password
			);
			if (!profile) {
				throw new Error("Feil brukernavn eller passord!");
			}
			sessionStorage.setItem("profileId", profile._id);
			console.log("Profil-ID lagret i sessionStorage:", profile._id);
		} else {
			const profileId = sessionStorage.getItem("profileId");
			console.log("Profil-ID hentet fra sessionStorage:", profileId);
			profile = profiles.find((profile) => profile._id === profileId);

			if (!profile) {
				throw new Error("Innlogget profil ikke funnet.");
			}
		}
		console.log("Hentet profil:", profile);
		return profile;
	} catch (error) {
		console.error("Klarte ikke å hente profil:", error);
		throw error;
	}
}

export { getUsers, getFavorites, getProfile };
