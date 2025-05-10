import { crudUrl } from "./auth.js";

async function updateProfile(userId, updatedData) {
	try {
		const response = await fetch(`${crudUrl}/profile/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updatedData),
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const updatedProfile = await response.json();
		console.log("Profil oppdatert:", updatedProfile);
		return updatedProfile;
	} catch (error) {
		console.error("Klarte ikke å oppdatere profilen", error);
		throw error;
	}
}

export { updateProfile };
