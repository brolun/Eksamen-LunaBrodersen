const config = {
	transform: {
		"^.+\\.(js|jsx)$": "babel-jest",
	},
	testEnvironment: "jsdom",
};

module.exports = config;
