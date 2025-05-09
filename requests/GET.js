import { crudUrl } from "./auth.js";

async function getUsers() {
	try {
		const response = await fetch(crudUrl);
		const data = await response.json();
		console.log(data);
	} catch (error) {
		console.error("Klarte ikke å hente brukere", error);
	}
}

export { getUsers };
