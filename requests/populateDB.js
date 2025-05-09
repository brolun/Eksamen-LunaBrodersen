import { crudUrl, randomUserUrl } from "./auth.js";

async function populateDatabase() {
	try {
		const getResponse = await fetch(randomUserUrl);
		const responseData = await getResponse.json();
		const users = responseData.results;
		console.log("Brukere hentet fra randomuser.me:", users);
		for (const user of users) {
			try {
				const postResponse = await fetch(crudUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(user),
				});
				const postData = await postResponse.json();
				console.log("Bruker lagt til i databasen:", postData);
			} catch (error) {
				console.error(
					"Klarte ikke å legge til bruker i databasen",
					error
				);
			}
		}
	} catch (error) {
		console.error("Klarte ikke å fylle databasen", error);
	}
}

populateDatabase();
