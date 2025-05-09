import { crudUrl } from "./auth.js";

async function addFavorite(user) {
	try {
		const response = await fetch(`${crudUrl}/favorites`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		console.log("Bruker lagt til i favoritter:", user);
	} catch (error) {
		console.error("Klarte ikke å legge til bruker i favoritter", error);
	}
}

export { addFavorite };
