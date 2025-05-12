import { crudUrl } from "./auth.js";

async function deleteUser(userId, category) {
	try {
		console.log(`Sletter bruker fra ${category} i CrudCrud ...`);
		const response = await fetch(`${crudUrl}/${category}/${userId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error("HTTP-feil! Status:", response.status);
		}
		console.log(`Bruker slettet fra ${category} i CrudCrud:`, userId);
	} catch (error) {
		console.error(
			`Klarte ikke å slette bruker fra ${category} i CrudCrud:`,
			error
		);
	}
}

export { deleteUser };
