import { crudUrl } from "./auth.js";

async function updateProfile(userId, updatedData) {
	try {
		const response = await fetch(`${crudUrl}/profiles/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updatedData),
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const responseText = await response.text();
		if (!responseText) {
			console.warn("Serveren returnerte en tom respons.");
			return null;
		}
		return JSON.parse(responseText);
	} catch (error) {
		console.error("Klarte ikke å oppdatere profilen", error);
		throw error;
	}
}

export { updateProfile };
