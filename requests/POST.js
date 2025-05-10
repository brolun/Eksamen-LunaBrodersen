import { crudUrl } from "./auth.js";

async function addFavorite(user) {
	try {
		const { _id, ...userWithoutId } = user;
		const response = await fetch(`${crudUrl}/favorites`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userWithoutId),
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

export { addFavorite };
