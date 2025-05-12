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
		let favorites =
			JSON.parse(localStorage.getItem("cachedFavorites")) || [];
		favorites.push(favoriteUser);
		localStorage.setItem("cachedFavorites", JSON.stringify(favorites));
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

export { addFavorite, addProfile };
