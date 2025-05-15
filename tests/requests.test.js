import { addProfile } from "../requests/POST.js";
import { getProfile } from "../requests/GET.js";
import { resizeImage } from "../requests/utils.js";
import { updateProfile } from "../requests/PUT.js";
import { deleteProfile } from "../requests/DELETE.js";

// Test 1: POST - addProfile
test("addProfile sender riktig data", async () => {
	const mockUser = {
		firstName: "Ola",
		lastName: "Nordmann",
		city: "Oslo",
		country: "Norge",
		age: 30,
		gender: "male",
		username: "olanordmann",
		password: "123456",
		profilePicture: "./assets/portrait-placeholder.png",
	};
	const result = await addProfile(mockUser);
	expect(result).toEqual(mockUser);
});

// Test 2: GET - getProfile
test("getProfile returnerer riktig profil", async () => {
	const mockCredentials = { username: "testuser", password: "123456" };
	const result = await getProfile(mockCredentials);
	expect(result).toHaveProperty("username", "testuser");
	expect(result).toHaveProperty("password", "123456");
});

// Test 3: utils - resizeImage
test("resizeImage returnerer en base64-streng", async () => {
	const mockFile = new Blob(["test"], { type: "image/png" });
	const result = await resizeImage(mockFile, 800, 800);
	expect(result).toMatch(/^data:image\/png;base64,/);
});

// Test 4: PUT - updateProfile
test("updateProfile oppdaterer en profil", async () => {
	const mockProfileId = "12345";
	const updatedData = {
		firstName: "Kari",
		lastName: "Nordmann",
		city: "Bergen",
		country: "Norge",
		age: 28,
		gender: "female",
		username: "karinordmann",
		password: "654321",
		profilePicture: "./assets/portrait-placeholder.png",
	};
	const result = await updateProfile(mockProfileId, updatedData);
	expect(result).toEqual(updatedData);
});

// Test 5: DELETE - deleteProfile
test("deleteProfile sletter en profil", async () => {
	const mockProfileId = "12345";
	const result = await deleteProfile(mockProfileId);
	expect(result).toBe(true);
});
