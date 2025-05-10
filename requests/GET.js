import { crudUrl } from "./auth.js";

async function getUsers() {
	try {
		const response = await fetch(`${crudUrl}/users`);
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

async function getFavorites() {
	try {
		const response = await fetch(`${crudUrl}/favorites`);
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		const data = await response.json();
		console.log(data);
		return data;
	} catch (error) {
		console.error("Klarte ikke å hente favoritter", error);
		return [];
	}
}

async function getProfiles() {
	try {
		const response = await fetch(`${crudUrl}/profiles`);
		if (!response.ok) {
			throw new Error("HTTP error! status:", response.status);
		}
		const profiles = await response.json();
		return profiles;
	} catch (error) {
		console.error("Klarte ikke å hente profiler", error);
		throw error;
	}
}

export { getUsers, getFavorites, getProfiles };
