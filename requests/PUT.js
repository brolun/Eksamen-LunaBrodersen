import { crudUrl } from "./auth.js";

async function updateProfile(profileId, updatedData) {
	try {
		console.log("Oppdaterer profil i CrudCrud ...");
		const response = await fetch(`${crudUrl}/profiles/${profileId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updatedData),
		});
		if (response.ok) {
			try {
				const data = await response.json();
				console.log("Profil oppdatert i CrudCrud:", data);
				return data;
			} catch (error) {
				return null;
			}
		} else {
			throw new Error("HTTP-feil! Status:", response.status);
		}
	} catch (error) {
		console.error("Feil ved oppdatering av profil:", error);
		throw error;
	}
}

async function updateFavorite(favoriteId, favorite) {
	try {
		console.log("Oppdaterer favoritt i CrudCrud ...");
		const response = await fetch(`${crudUrl}/favorites/${favoriteId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(favorite),
		});
		if (response.ok) {
			const contentLength = response.headers.get("Content-Length");
			if (contentLength && parseInt(contentLength) > 0) {
				const data = await response.json();
				console.log("Favoritt oppdatert i CrudCrud:", data);
				return data;
			} else {
				return null;
			}
		} else {
			throw new Error(`HTTP-feil! Status: ${response.status}`);
		}
	} catch (error) {
		console.error("Feil ved oppdatering av favoritt i CrudCrud:", error);
		throw error;
	}
}

export { updateProfile, updateFavorite };
