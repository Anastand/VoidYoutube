// this file is applicable to work on the youtube page

// Attempt to find the video element on the page
let video = document.querySelector("video");
// If video doesn't exist yet, keep checking; this handles YouTube's dynamic content loading
if (!video) {
	const checkInterval = setInterval(() => {
		video = document.querySelector("video");
		if (video) {
			clearInterval(checkInterval);
			attachListeners();
		}
	}, 100);
} else {
	// If video is already present, attach listeners immediately
	attachListeners();
}

/**
 * Initializes monitoring logic and attaches play/pause listeners to the video.
 */

function attachListeners() {
	let videoTitle;
	let creator;
	let pollingIntervalId = null; // Store interval ID here
	let startTime;
	let capExceeded = false;
	function startPooling() {
		if (pollingIntervalId != null) return;
		pollingIntervalId = setInterval(() => {
			console.log("Polling...");
			if (!startTime) return; // the video is not playing
			let currentSessionElapsed = (new Date() - startTime) / 1000; // convert the time in seconds
			chrome.runtime.sendMessage(
				{
					action: "check-block-status",
					currentSessionElapsed: currentSessionElapsed,
				},
				(response) => {
					console.log(
						`send the check-block-status msg for pooling check ${response}`,
					);

					if (response.blockYt) {
						video.pause();
						showToast(" exceeded your allowed time  bro pls go work");
						capExceeded = response.blockYt;
						clearInterval(pollingIntervalId);
						pollingIntervalId = null;
					} else if (capExceeded) {
						capExceeded = false;
						showToast("Limit increased. You can watch again.");
					}
				},
			);
		}, 10_000);
	}
	function stopPooling() {
		clearInterval(pollingIntervalId);
		pollingIntervalId = null;
	}
	if (!video.paused) {
		startPooling();
	}
	// On load, ask the background script if the daily time limit is already exceeded
	chrome.runtime.sendMessage({ action: "check-block-status" }, (response) => {
		console.log(`send the check-block-status msg ${response}`);

		if (response.blockYt) {
			video.pause();
			showToast(" exceeded your allowed time  bro pls go work");
			capExceeded = response.blockYt;
		}
	});

	/**
	 * Creates and displays a temporary notification on the UI.
	 */
	function showToast(message) {
		const toast = document.createElement("div");
		toast.textContent = message;
		toast.style.position = "fixed";
		toast.style.bottom = "20px";
		toast.style.right = "20px";
		toast.style.backgroundColor = "red";
		toast.style.color = "white";
		toast.style.padding = "15px";
		toast.style.borderRadius = "5px";
		toast.style.zIndex = "9999";

		document.body.appendChild(toast);

		// Auto-remove the toast after 2.5 seconds
		setTimeout(() => toast.remove(), 2500);
	}

	// Triggered when the video starts playing
	video.addEventListener("play", () => {
		videoTitle =
			document.querySelector("#below #title h1")?.textContent?.trim() ||
			"Not-Recorded";
		creator =
			document
				.querySelector("ytd-video-owner-renderer #channel-name a")
				?.textContent?.trim() || "Not-Recorded";
		console.log("PLAY EVENT FIRED");
		startTime = new Date(); // Track the current time when playback starts
		startPooling();

		// Prevent playback if the cap is already reached
		chrome.runtime.sendMessage(
			{
				action: "check-block-status",
				currentSessionElapsed: 0,
			},
			(response) => {
				if (response.blockYt) {
					video.pause();
					capExceeded = true;
					showToast(" exceeded your allowed time  bro pls go work");
				} else {
					capExceeded = false; // Unblock if limit was increased
					startPooling(); // Only start polling if playback is allowed
				}
			},
		);
	});

	// Triggered when the video is paused
	video.addEventListener("pause", () => {
		console.log("PAUSE EVENT FIRED");
		stopPooling();
		// Ignore pause events that occur without a preceding play event
		if (!startTime) {
			console.log("Pause fired before play. Ignoring.");
			return;
		}

		// Calculate the number of seconds elapsed since the last 'play' event
		const elapsed = (new Date() - startTime) / 1000;
		startTime = null;

		// Send the duration to the background script to update total watch time
		chrome.runtime.sendMessage(
			{
				action: "log-watch-time",
				elapsed: elapsed,
				url: window.location.href,
				creator: creator,
				videoTitle: videoTitle,
			},
			(response) => {
				console.log("log watch time", response);

				// If the updated watch time exceeds the limit, trigger the block UI
				if (response.blockYt) {
					capExceeded = true;
					console.log("bro you exceeded your limit pls stop watching");
					showToast(" exceeded your allowed time ");
				}
			},
		);
	});
}
