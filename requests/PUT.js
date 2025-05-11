import { crudUrl } from "./auth.js";

async function updateProfile(profileId, updatedData) {
	try {
		console.log("Sender oppdaterte data til serveren:", updatedData);

		const response = await fetch(`${crudUrl}/profiles/${profileId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updatedData),
		});

		console.log("Serverens respons:", response);

		if (response.ok) {
			try {
				const data = await response.json();
				console.log("Profil oppdatert:", data);
				return data;
			} catch (error) {
				console.warn("Serveren returnerte ingen data.");
				return null;
			}
		} else {
			throw new Error(`HTTP-feil! Status: ${response.status}`);
		}
	} catch (error) {
		console.error("Feil ved oppdatering av profil:", error);
		throw error;
	}
}

export { updateProfile };
