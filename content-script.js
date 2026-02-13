// content-script.js (based on your structure; function names preserved)

let cleanup = null;
let boundVideoEl = null;
let videoEl;

// Page-level meta (global)
let currentPageVideoTitle = "Not-Recorded";
let currentPageCreator = "Not-Recorded";
let currentPageurl = window.location.href;
let currentPageVideoId = null;
let ready = false;

function isWatchPage() {
	return location.pathname === "/watch";
}

function getVideoIdFromUrl(url) {
	try {
		return new URL(url).searchParams.get("v");
	} catch {
		return null;
	}
}

function firstMatch(selectors) {
	for (const sel of selectors) {
		const el = document.querySelector(sel);
		if (el) return el;
	}
	return null;
}

// Page-level metadata updater (global vars)
function getVideoMetaData() {
	if (!isWatchPage()) return;

	currentPageurl = window.location.href;
	currentPageVideoId = getVideoIdFromUrl(currentPageurl);

	const titleEl = firstMatch([
		"#below #title h1",
		"ytd-watch-metadata h1",
		"h1.style-scope.ytd-watch-metadata",
		"#title h1",
	]);

	const creatorEl = firstMatch([
		"ytd-video-owner-renderer #channel-name a",
		"ytd-watch-metadata #channel-name a",
	]);

	currentPageVideoTitle = titleEl?.textContent?.trim() || "Not-Recorded";
	currentPageCreator = creatorEl?.textContent?.trim() || "Not-Recorded";

	ready =
		currentPageVideoTitle !== "Not-Recorded" &&
		currentPageCreator !== "Not-Recorded";
}

// You were calling this before; keep the function name
function getYoutubeState() {
	if (!isWatchPage()) return null;

	getVideoMetaData();

	return {
		url: window.location.href,
		videoTitle: currentPageVideoTitle || "Loading...",
		creator: currentPageCreator || "Loading...",
		videoId: getVideoIdFromUrl(window.location.href),
		ready,
	};
}

function ensureVideoBound(retryCount = 0) {
	if (!isWatchPage()) {
		boundVideoEl = null;

		if (cleanup) {
			cleanup();
			cleanup = null;
		}

		return;
	}

	videoEl = document.querySelector("video");

	if (!videoEl) {
		if (retryCount < 30) {
			setTimeout(() => ensureVideoBound(retryCount + 1), 400);
		}
		return;
	}

	if (videoEl === boundVideoEl) return;

	if (cleanup) {
		cleanup();
		cleanup = null;
	}

	boundVideoEl = videoEl;

	cleanup = attachListeners(videoEl);
}

window.addEventListener("yt-navigate-finish", () => {
	// New watch page → reset readiness, then hydrate
	currentPageurl = window.location.href;
	currentPageVideoId = getVideoIdFromUrl(currentPageurl);
	currentPageVideoTitle = "Not-Recorded";
	currentPageCreator = "Not-Recorded";
	ready = false;

	ensureVideoBound();

	// Retry metadata a few times because DOM hydration is delayed on YouTube
	let tries = 0;

	const tick = () => {
		tries += 1;

		if (!isWatchPage()) return;
		if (getVideoIdFromUrl(window.location.href) !== currentPageVideoId) return;

		const state = getYoutubeState();
		if (state?.ready) {
			return;
		}

		if (tries < 15) setTimeout(tick, 200);
	};

	setTimeout(tick, 0);
});

// Initial attempt
ensureVideoBound();

function attachListeners(videoEl) {
	// Session-level meta (local, locked per session)
	let sessionVideoTitle = "Not-Recorded";
	let sessionCreator = "Not-Recorded";
	let sessionUrl = null;
	let sessionVideoId = null;

	let pollingIntervalId = null;
	let startTime = null;

	let capExceeded = false;
	let ignoreNextPause = false;
	let startRequested = false;
	let disposed = false;

	let metaRetryTimeoutId = null;

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
		setTimeout(() => toast.remove(), 2500);
	}

	function stopPolling() {
		if (pollingIntervalId == null) return;
		clearInterval(pollingIntervalId);
		pollingIntervalId = null;
	}

	function globalToLocal(count = 0) {
		if (disposed) return;

		// Only copy if meta belongs to the same video
		if (sessionVideoId == null || currentPageVideoId == null) return;
		if (sessionVideoId !== currentPageVideoId) return;

		if (ready) {
			sessionVideoTitle = currentPageVideoTitle;
			sessionCreator = currentPageCreator;
			return;
		}

		if (count < 15) {
			metaRetryTimeoutId = setTimeout(() => {
				globalToLocal(count + 1);
			}, 200);
		}
	}

	function startPolling() {
		if (pollingIntervalId != null) return;

		pollingIntervalId = setInterval(() => {
			if (disposed) return;
			if (!startTime) return;

			const currentSessionElapsed = (new Date() - startTime) / 1000;

			chrome.runtime.sendMessage(
				{
					action: "check-block-status",
					currentSessionElapsed,
				},
				(response) => {
					if (disposed) return;
					if (!response) return;

					if (response.blockYt) {
						ignoreNextPause = true;
						videoEl.pause();
						showToast("exceeded your allowed time. go work.");
						capExceeded = true;
						stopPolling();
					} else if (capExceeded) {
						capExceeded = false;
						showToast("Limit increased. You can watch again.");
					}
				},
			);
		}, 10_000);
	}

	function logwatchTime(reason) {
		stopPolling();

		if (disposed) return;

		if (!startTime) {
			return;
		}

		// Last best-effort metadata sync before writing the session.
		getVideoMetaData();
		if (sessionVideoId != null && currentPageVideoId === sessionVideoId && ready) {
			sessionVideoTitle = currentPageVideoTitle;
			sessionCreator = currentPageCreator;
		}

		const elapsed = (new Date() - startTime) / 1000;

		// Clear immediately to prevent double logs (pause + nav-start)
		startTime = null;
		startRequested = false;

		chrome.runtime.sendMessage(
			{
				action: "log-watch-time",
				elapsed,
				url: sessionUrl || window.location.href,
				creator: sessionCreator,
				videoTitle: sessionVideoTitle,
				reason,
			},
			(response) => {
				if (disposed) return;
				if (response?.blockYt) {
					capExceeded = true;
					showToast("exceeded your allowed time.");
				}
			},
		);
	}

	function startSessionIfAllowed() {
		if (disposed) return;

		if (startRequested || startTime) return;

		startRequested = true;

		// Capture session identity immediately (fixes fast Home/back)
		sessionUrl = window.location.href;
		sessionVideoId = getVideoIdFromUrl(sessionUrl);

		// Start time immediately (fixes first pause doing nothing)
		startTime = new Date();

		// Kick metadata capture/copy immediately
		getVideoMetaData();
		globalToLocal(0);

		chrome.runtime.sendMessage(
			{
				action: "check-block-status",
				currentSessionElapsed: 0,
			},
			(response) => {
				if (disposed) return;

				startRequested = false;

				if (!response) return;

				if (response.blockYt) {
					// Cancel the session and pause; do not log this forced pause
					ignoreNextPause = true;
					startTime = null;
					stopPolling();

					videoEl.pause();
					capExceeded = true;
					showToast("exceeded your allowed time. go work.");
					return;
				}

				capExceeded = false;
				startPolling();
			},
		);
	}

	// Catch autoplay / already playing at bind time
	if (!videoEl.paused) {
		startSessionIfAllowed();
	}

	// On load, ask background if already blocked (best-effort)
	chrome.runtime.sendMessage({ action: "check-block-status" }, (response) => {
		if (disposed) return;
		if (response?.blockYt) {
			ignoreNextPause = true;
			startTime = null;
			stopPolling();

			videoEl.pause();
			showToast("exceeded your allowed time. go work.");
			capExceeded = true;
		}
	});

	const onPlay = () => {
		startSessionIfAllowed();
	};

	const onPause = () => {
		if (ignoreNextPause) {
			ignoreNextPause = false;
			return;
		}

		logwatchTime("pause");
	};

	const onNavigateStart = () => {
		logwatchTime("yt-navigate-start");
	};

	const onPageHide = () => {
		logwatchTime("pagehide");
	};

	const onPopState = () => {
		logwatchTime("popstate");
	};

	const onBeforeUnload = () => {
		logwatchTime("beforeunload");
	};

	videoEl.addEventListener("play", onPlay);
	videoEl.addEventListener("pause", onPause);

	window.addEventListener("yt-navigate-start", onNavigateStart);
	window.addEventListener("pagehide", onPageHide);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("beforeunload", onBeforeUnload);

	return () => {
		if (!disposed && startTime) {
			logwatchTime("cleanup");
		}

		// Proper cleanup (detach everything this binding attached)
		disposed = true;

		stopPolling();

		if (metaRetryTimeoutId != null) {
			clearTimeout(metaRetryTimeoutId);
			metaRetryTimeoutId = null;
		}

		videoEl.removeEventListener("play", onPlay);
		videoEl.removeEventListener("pause", onPause);

		window.removeEventListener("yt-navigate-start", onNavigateStart);
		window.removeEventListener("pagehide", onPageHide);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("beforeunload", onBeforeUnload);
	};
}
