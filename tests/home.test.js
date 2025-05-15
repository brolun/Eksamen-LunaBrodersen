import {
	populateEditForm,
	handleFilters,
	createFavoriteButton,
	createMessageButton,
	notifyOfMutualMatch,
} from "../home.js";

// Test 1: populateEditForm
test("populateEditForm fyller ut brukerdata i skjemaet", () => {
	document.body.innerHTML = `
        <input id="edit-first-name" />
        <input id="edit-last-name" />
        <input id="edit-city" />
        <input id="edit-country" />
        <input id="edit-age" />
        <input id="edit-gender" />
        <input id="edit-username" />
        <input id="edit-password" />
    `;
	const mockUser = {
		firstName: "Ola",
		lastName: "Nordmann",
		city: "Oslo",
		country: "Norge",
		age: 30,
		gender: "male",
		username: "olanordmann",
		password: "123456",
	};
	populateEditForm(mockUser);

	expect(document.getElementById("edit-first-name").value).toBe("Ola");
	expect(document.getElementById("edit-last-name").value).toBe("Nordmann");
	expect(document.getElementById("edit-city").value).toBe("Oslo");
	expect(document.getElementById("edit-country").value).toBe("Norge");
	expect(document.getElementById("edit-age").value).toBe("30");
	expect(document.getElementById("edit-gender").value).toBe("male");
	expect(document.getElementById("edit-username").value).toBe("olanordmann");
	expect(document.getElementById("edit-password").value).toBe("");
});

// Test 2: handleFilters
test("handleFilters lagrer filtreringsvalg i localStorage", () => {
	document.body.innerHTML = `
        <select id="gender-select">
            <option value="male">Male</option>
            <option value="female">Female</option>
        </select>
        <select id="age-range">
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
        </select>
    `;
	localStorage.clear();
	handleFilters();

	const genderSelect = document.getElementById("gender-select");
	genderSelect.value = "female";
	genderSelect.dispatchEvent(new Event("change"));
	const ageRangeSelect = document.getElementById("age-range");
	ageRangeSelect.value = "18-25";
	ageRangeSelect.dispatchEvent(new Event("change"));

	expect(localStorage.getItem("selectedGender")).toBe("female");
	expect(localStorage.getItem("ageRange")).toBe("18-25");
});

// Test 3: createMessageButton
test("createMessageButton oppretter en knapp med riktig tekst", () => {
	const mockUser = { firstName: "Ola" };

	const messageButton = createMessageButton(mockUser);

	expect(messageButton.tagName).toBe("BUTTON");
	expect(messageButton.textContent).toBe("🗨");
	expect(messageButton.classList.contains("message-button")).toBe(true);
});

// Test 4: notifyOfMutualMatch
test("notifyOfMutualMatch oppdaterer status til en favoritt", () => {
	document.body.innerHTML = `
        <div id="favorites-container">
            <div class="usercard">
                <h3>Ola Nordmann</h3>
                <div class="status-indicator"></div>
            </div>
        </div>
    `;
	const favorite = { name: { first: "Ola", last: "Nordmann" } };
	const favoriteList = document.getElementById("favorites-container");

	notifyOfMutualMatch(favorite, favoriteList);

	setTimeout(() => {
		const statusIndicator = favoriteList.querySelector(".status-indicator");
		expect(statusIndicator.textContent).toMatch(/❤|✖/);
	}, 1000);
});

// Test 5: createFavoriteButton
test("createFavoriteButton oppretter en knapp med riktig tekst", () => {
	const mockUser = { firstName: "Ola" };
	const mockUserCard = document.createElement("div");
	const favoriteButton = createFavoriteButton(mockUser, mockUserCard);

	expect(favoriteButton.tagName).toBe("BUTTON");
	expect(favoriteButton.textContent).toBe("❤");
	expect(favoriteButton.classList.contains("yes-button")).toBe(true);
});
