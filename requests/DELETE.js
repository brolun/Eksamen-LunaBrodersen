import { crudUrl } from "./auth.js";

async function deleteUser(userId) {
	try {
		const response = await fetch(`${crudUrl}/${userId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		console.log("Bruker slettet:", userId);
	} catch (error) {
		console.error("Klarte ikke å slette bruker", error);
	}
}

export { deleteUser };
