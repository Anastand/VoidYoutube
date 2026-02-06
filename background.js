// Listens for messages sent from other parts of the extension (e.g., content scripts)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("message received in background.js", message);

	// Get the current date in YYYY-MM-DD format to use as a key for daily storage
	let todayDate = new Date().toISOString().split("T")[0];

	// Set the daily limit from the user's preferences
	let limit = null; // must be in seconds

	// Check if the user has already exceeded their daily time limit
	if (message.action === "check-block-status") {
		const currentSessionElapsed = message.currentSessionElapsed || 0;
		chrome.storage.sync.get(["dailyLimitMinutes"], (data) => {
			limit = (data.dailyLimitMinutes || 40) * 60;
			chrome.storage.local.get([todayDate], (result) => {
				console.log(result);
				let exist = result[todayDate];
				console.log(exist);

				// If no record exists for today, YouTube should not be blocked
				if (!result || !exist) {
					sendResponse({ blockYt: false });
					return;
				}

				let effectiveTimeElapsed =
					exist.totalTimeSeconds + currentSessionElapsed;
				sendResponse({ blockYt: effectiveTimeElapsed > limit });
			});
		});
		// Return true to indicate an asynchronous response via sendResponse
		return true;
	}

	// Update the stored watch time for the current date
	if (message.action === "log-watch-time") {
		const elapsed = message.elapsed;
		const url = message.url;
		chrome.storage.sync.get(["dailyLimitMinutes"], (data) => {
			const limit = (data.dailyLimitMinutes || 40) * 60;
			chrome.storage.local.get([todayDate], (result) => {
				let exist = result[todayDate];
				console.log(result);
				console.log(exist);

				if (!result || !exist) {
					// Initialize a new entry if this is the first log of the day
					exist = {
						date: todayDate,
						totalTimeSeconds: elapsed,
						session: [{ videoUrl: url, watchTime: elapsed }],
					};
				} else {
					// Increment total time and append the specific session details
					exist.totalTimeSeconds += elapsed;
					exist.session.push({
						videoUrl: url,
						watchTime: elapsed,
					});
				}

				// Save the updated data back to local storage
				chrome.storage.local.set({ [todayDate]: exist });

				// Inform the sender if the new total has pushed the user over the limit
				if (exist.totalTimeSeconds > limit) {
					sendResponse({ blockYt: true });
				} else {
					sendResponse({ blockYt: false });
				}
			});
		});
		// Return true to indicate an asynchronous response via sendResponse
		return true;
	}
});
