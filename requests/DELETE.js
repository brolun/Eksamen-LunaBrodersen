import { crudUrl } from "./auth.js";

async function deleteUser(userId, category) {
	try {
		const response = await fetch(`${crudUrl}/${category}/${userId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		console.log(`Bruker slettet fra ${category}:`, userId);
	} catch (error) {
		console.error(`Klarte ikke å slette bruker fra ${category}`, error);
	}
}

export { deleteUser };
