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
	let startTime;
	let capExceeded = false;

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
		console.log("PLAY EVENT FIRED");
		startTime = new Date(); // Track the current time when playback starts

		// Prevent playback if the cap is already reached
		if (capExceeded) {
			video.pause();
			console.log("bro you exceeded your limit pls stop watching");
			return;
		}
	});

	// Triggered when the video is paused
	video.addEventListener("pause", () => {
		console.log("PAUSE EVENT FIRED");

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
			{ action: "log-watch-time", elapsed: elapsed, url: window.location.href },
			(response) => {
				console.log("response from background", response);

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
