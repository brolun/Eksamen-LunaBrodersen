import { crudUrl } from "./auth.js";

async function getUsers() {
	try {
		const response = await fetch(crudUrl);
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		const data = await response.json();
		console.log(data);
		return data;
	} catch (error) {
		console.error("Klarte ikke å hente brukere", error);
		return [];
	}
}

export { getUsers };
