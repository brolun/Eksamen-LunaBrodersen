import { crudUrl } from "./auth.js";

async function addFavorite(user) {
	try {
		const { _id, ...userWithoutId } = user;
		const favoriteWithMatchStatus = {
			...userWithoutId,
			matched: "",
		};
		const response = await fetch(`${crudUrl}/favorites`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(favoriteWithMatchStatus),
		});
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		const favoriteUser = await response.json();
		console.log("Bruker lagt til i favoritter:", favoriteUser);
	} catch (error) {
		console.error("Klarte ikke å legge til bruker i favoritter", error);
	}
}

async function addProfile(user) {
	try {
		const response = await fetch(`${crudUrl}/profiles`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		const createdProfile = await response.json();
		console.log("Ny profil opprettet:", createdProfile);
		return createdProfile;
	} catch (error) {
		console.error("Klarte ikke å opprette profil", error);
		throw error;
	}
}

async function loginUser(username, password) {
	try {
		const response = await fetch(`${crudUrl}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});
		if (!response.ok) {
			throw new Error("Feil brukernavn eller passord!");
		}
		const loggedInUser = await response.json();
		console.log("Innlogging vellykket:", loggedInUser);
		return loggedInUser;
	} catch (error) {
		console.error("Kunne ikke logge inn:", error);
		throw error;
	}
}

export { addFavorite, addProfile, loginUser };
