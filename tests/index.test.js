test("Registreringsskjemaet finnes i DOM-en", () => {
	document.body.innerHTML = `
        <form id="new-user-form"></form>
    `;
	const form = document.getElementById("new-user-form");
	expect(form).not.toBeNull();
});

test("Innloggingsskjemaet finnes i DOM-en", () => {
	document.body.innerHTML = `
        <form id="login-form"></form>
    `;
	const form = document.getElementById("login-form");
	expect(form).not.toBeNull();
});

test("goToLoginLink bytter visning mellom skjemaer", () => {
	document.body.innerHTML = `
        <div id="register-container" style="display: flex;"></div>
        <div id="login-container" style="display: none;"></div>
        <a href="#" id="go-to-login"></a>
    `;

	const registerContainer = document.getElementById("register-container");
	const loginContainer = document.getElementById("login-container");
	const goToLoginLink = document.getElementById("go-to-login");

	goToLoginLink.addEventListener("click", (event) => {
		event.preventDefault();
		registerContainer.style.display = "none";
		loginContainer.style.display = "flex";
	});

	goToLoginLink.click();

	expect(registerContainer.style.display).toBe("none");
	expect(loginContainer.style.display).toBe("flex");
});

test("goToRegisterLink bytter visning mellom skjemaer", () => {
	document.body.innerHTML = `
        <div id="login-container" style="display: flex;"></div>
        <div id="register-container" style="display: none;"></div>
        <a href="#" id="go-to-register"></a>
    `;

	const loginContainer = document.getElementById("login-container");
	const registerContainer = document.getElementById("register-container");
	const goToRegisterLink = document.getElementById("go-to-register");

	goToRegisterLink.addEventListener("click", (event) => {
		event.preventDefault();
		loginContainer.style.display = "none";
		registerContainer.style.display = "flex";
	});

	goToRegisterLink.click();

	expect(loginContainer.style.display).toBe("none");
	expect(registerContainer.style.display).toBe("flex");
});

test("Velg en fil oppdaterer profilbilde-forhåndsvisningen", () => {
	document.body.innerHTML = `
        <input type="file" id="profile-picture" />
        <img id="profile-preview" src="./assets/portrait-placeholder.png" />
        <span id="file-name">Ingen fil valgt</span>
    `;

	const fileInput = document.getElementById("profile-picture");
	const profilePreview = document.getElementById("profile-preview");
	const fileName = document.getElementById("file-name");

	fileInput.addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (file) {
			fileName.textContent = file.name;
			profilePreview.src = "data:image/png;base64,testdata";
		} else {
			profilePreview.src = "./assets/portrait-placeholder.png";
		}
	});
	const file = new File(["test"], "test.png", { type: "image/png" });
	Object.defineProperty(fileInput, "files", {
		value: [file],
	});
	fileInput.dispatchEvent(new Event("change"));

	expect(fileName.textContent).toBe("test.png");
	expect(profilePreview.src).toBe("data:image/png;base64,testdata");
});
