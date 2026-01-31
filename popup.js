document.addEventListener("DOMContentLoaded", () => {
	const input = document.getElementById("limit-input");
	const button = document.getElementById("limit-button");
	const currentLimit = document.getElementById("currentLimit");
	const status = document.getElementById("status");

	// Load current value on open
	chrome.storage.sync.get(["dailyLimitMinutes"], (data) => {
		currentLimit.textContent = data.dailyLimitMinutes
			? `Current Limit: ${data.dailyLimitMinutes} minutes`
			: "No limit set (default: 30)";
	});

	button.addEventListener("click", () => {
		const val = parseInt(input.value); // Convert to number
		chrome.storage.sync.set({ dailyLimitMinutes: val }, () => {
			status.textContent = "Saved!"; // Show feedback here, not on load
			currentLimit.textContent = `Current Limit: ${val} minutes`;
		});
	});
});
