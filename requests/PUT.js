import { crudUrl } from "./auth.js";

async function updateUserStatus(userId, status) {
	try {
		const response = await fetch(`${crudUrl}/users/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ status: status }),
		});
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		console.log("Brukerstatus oppdatert:", userId, status);
	} catch (error) {
		console.error("Klarte ikke å oppdatere brukerstatus", error);
	}
}

export { updateUserStatus };
