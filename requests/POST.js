import { crudUrl } from "./auth.js";

async function addFavorite(user) {
	try {
		console.log("Favoritt opprettes i CrudCrud ...");
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
			throw new Error("HTTP-feil! Status:", response.status);
		}
		const favoriteUser = await response.json();
		console.log("Favoritt opprettet i CrudCrud:", favoriteUser);
	} catch (error) {
		console.error("Klarte ikke å opprette favoritt i CrudCrud:", error);
	}
}

async function addProfile(user) {
	try {
		console.log("Ny profil opprettes i CrudCrud ...");
		const response = await fetch(`${crudUrl}/profiles`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});
		if (!response.ok) {
			throw new Error("HTTP-feil! Status:", response.status);
		}
		const createdProfile = await response.json();
		console.log("Ny profil opprettet i CrudCrud:", createdProfile);
		return createdProfile;
	} catch (error) {
		console.error("Klarte ikke å opprette ny profil i CrudCrud:", error);
		throw error;
	}
}

export { addFavorite, addProfile };
