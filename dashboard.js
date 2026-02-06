const SNARK_DB = {
	TIER_LOW: [
		// 0-25%
		"Oh, look who decided to grace us with their mediocrity.",
		"Is the YouTube algorithm your only friend, or just your master?",
		"You’re already failing and the day has barely started.",
		"That thumbnail isn't a career path, you absolute walnut.",
		"Watching someone else live their life won't fix your pathetic one.",
		"Early bird gets the worm, but you're just the dirt.",
		"The bar was on the floor and you brought a shovel.",
		"Your ambition is a ghost town.",
		"I’ve seen inanimate objects with more drive than you.",
		"Starting the day with a deficit? Classic you.",
		"Is this your 'peak performance'? Because it's depressing.",
		"I’d call you a disappointment, but that would imply I had expectations.",
		"You’re like a software update that everyone ignores.",
		"Your focus is as sharp as a bowling ball.",
		"Just a reminder: 'Later' is where dreams go to die.",
	],
	TIER_MID: [
		// 26-50%
		"Halfway through the day and you’ve achieved... absolutely nothing.",
		"Your potential is currently a rounded zero. Impressive, in a sad way.",
		"Are you waiting for an award for 'Most Consistent Time-Waster'?",
		"If laziness were an Olympic sport, you’d still be too tired to show up.",
		"The 'Recommended' section is your tombstone. Keep digging.",
		"You’re working hard at being completely useless.",
		"Even a broken clock is right twice; you’re just wrong 24/7.",
		"Your 'to-do' list is starting to look like a suicide note for your career.",
		"Is that another cat video, or just your brain melting in real-time?",
		"The world is moving. You’re just vibrating in place.",
		"If procrastination paid, you'd be a billionaire. But it doesn't, and you're not.",
		"You have the work ethic of a decorative pillow.",
		"I've seen dial-up modems with faster output than you.",
		"Your life is a 'Before' picture with no 'After' in sight.",
		"Are you actually this slow, or is it a performance art piece?",
	],
	TIER_HIGH: [
		// 51-75%
		"The sun is setting on your productivity and your dignity.",
		"You’re not 'decompressing,' you’re decomposing.",
		"Imagine if you put 10% of this effort into something that paid bills.",
		"Your ancestors survived wars so you could watch 10-hour loops of white noise?",
		"At this rate, your resume is just going to be a link to your watch history.",
		"You’re not a 'slow starter,' you’re a 'non-finisher.'",
		"The light at the end of the tunnel is just another video you shouldn't watch.",
		"Your brain is 70% water, but I'm starting to think yours is 100% fluff.",
		"Tick tock. That’s the sound of your opportunities evaporating.",
		"You're a master of the 'unproductive pivot.'",
		"Is it hard being this consistently pathetic, or does it come naturally?",
		"You’ve reached the 'hopeless' phase of the afternoon.",
		"Your future self is currently screaming at you. Can you hear it?",
		"You’re like a library book that’s 10 years overdue. Useless and forgotten.",
		"Do you ever get tired of being your own worst enemy?",
	],
	TIER_CRITICAL: [
		// 76-99%
		"Drowning in the void, and you're asking for more water.",
		"The smell of wasted potential is getting really offensive now.",
		"Is this your legacy? A thumb-callus and a dry brain?",
		"You are the reason ‘Warning’ labels exist on shampoo bottles.",
		"Close the tab. Or don't. At this point, failure is your brand.",
		"You’ve successfully converted another day into pure garbage.",
		"The only thing you've finished today is your battery life.",
		"If you were an NPC, you’d be the one that gives no quests and just stands there.",
		"You’re one video away from complete mental atrophy.",
		"Congratulations, you’ve hit rock bottom. Want a shovel?",
		"Your life is a cautionary tale for people with actual goals.",
		"You’re not just behind; you’re in a different race entirely.",
		"Watching you try to focus is like watching a toddler try to solve calculus.",
		"The abyss isn't staring back, it's laughing at you.",
		"You’re the human equivalent of a participation trophy.",
	],
	TIER_BLOCKED: [
		// 100%
		"Game over. You officially have the attention span of a goldfish.",
		"Blocked. Get out. I’m embarrassed to be processing your requests.",
		"Go outside. The real world is that big bright thing you’re ignoring.",
		"I’m done. Even a silicon processor can feel second-hand shame.",
		"Delete your account. For the good of humanity.",
		"Access denied. Try again when you have a personality.",
		"You’ve maxed out your uselessness quota for the decade.",
		"I’m calling the police. You’ve murdered your own future.",
		"This screen is the only thing bright about your life right now.",
		"Error 404: Motivation not found. System shutting down to save itself.",
		"You are a black hole of productivity.",
		"I would explain why this is bad, but you wouldn't pay attention anyway.",
		"Final warning: Get a life or get out of mine.",
		"You’ve won! Your prize is a lifetime of regret.",
		"Go away. Even the internet is bored of you.",
	],
};

function createDashboard(percentage, insult) {
	// 1. Create Container
	const dashboard = document.createElement("div");
	dashboard.id = "voidtube-dashboard";

	// UPDATED STYLES FOR SMALL DASHBOARD - CENTERED
	dashboard.style.width = "100%";
	dashboard.style.maxWidth = "800px";
	dashboard.style.margin = "20px auto"; // Centered with top margin
	dashboard.style.padding = "20px";
	dashboard.style.display = "flex";
	dashboard.style.flexDirection = "column";
	dashboard.style.alignItems = "center"; // Center items horizontally
	dashboard.style.boxSizing = "border-box"; // Prevent padding from breaking width
	dashboard.style.backgroundColor = "#111";
	dashboard.style.border = "2px solid #ff0000";
	dashboard.style.boxShadow = "0 4px 20px rgba(255, 0, 0, 0.3)";
	dashboard.style.color = "#fff";
	dashboard.style.fontFamily = "monospace";
	dashboard.style.zIndex = "9999";
	dashboard.style.borderRadius = "8px";
	dashboard.style.textAlign = "center"; // Ensure text is centered

	// 2. Header Text (Time Spent)
	const timeText = document.createElement("h1");
	timeText.textContent = `${percentage}% WASTED`;
	timeText.id = "vt-time-text";
	timeText.style.fontSize = "28px";
	timeText.style.margin = "0 0 15px 0";
	timeText.style.color = "#ff0000";
	timeText.style.fontWeight = "bold";
	timeText.style.textAlign = "center";
	timeText.style.width = "100%";

	// 3. Progress Bar
	const barContainer = document.createElement("div");
	barContainer.style.width = "100%";
	barContainer.style.maxWidth = "600px"; // Constrain bar width
	barContainer.style.height = "10px";
	barContainer.style.backgroundColor = "#333";
	barContainer.style.margin = "0 auto 15px auto"; // Centered
	barContainer.style.borderRadius = "5px";
	barContainer.style.overflow = "hidden";

	const barFill = document.createElement("div");
	barFill.id = "vt-bar-fill";
	barFill.style.height = "100%";
	barFill.style.width = `${percentage}%`;
	barFill.style.backgroundColor = "#ff0000";
	barFill.style.transition = "width 0.3s ease";

	barContainer.appendChild(barFill);

	// 4. Snarky Message
	const messageText = document.createElement("p");
	messageText.textContent = insult;
	messageText.id = "vt-message";
	messageText.style.fontSize = "14px";
	messageText.style.lineHeight = "1.5";
	messageText.style.color = "#ccc";
	messageText.style.textAlign = "center";
	messageText.style.margin = "0";
	messageText.style.width = "100%";

	// 5. Assemble
	dashboard.appendChild(timeText);
	dashboard.appendChild(barContainer);
	dashboard.appendChild(messageText);

	// 6. INJECTION - Insert before the content grid
	const browseContainer = document.querySelector(
		'ytd-browse[page-subtype="home"]',
	);

	if (browseContainer) {
		// Insert as first child so it appears above the void
		browseContainer.prepend(dashboard, browseContainer.firstChild);
	} else {
		document.body.appendChild(dashboard);
	}
}

function updateDashboard(percentage, insult) {
	const timeText = document.getElementById("vt-time-text");
	const barFill = document.getElementById("vt-bar-fill");
	const messageText = document.getElementById("vt-message");

	if (timeText) timeText.textContent = `${percentage}% WASTED`;
	if (barFill) barFill.style.width = `${percentage}%`;
	if (messageText) messageText.textContent = insult;
}

function VoidtubeDashboard() {
	let insult;
	let percentage;
	let todayDate = new Date().toISOString().split("T")[0];

	function isHomepage() {
		return location.hostname === "www.youtube.com" && location.pathname === "/";
	}

	chrome.storage.local.get([todayDate], (result) => {
		let exist = result[todayDate];
		let totalTime = exist?.totalTimeSeconds;
		chrome.storage.sync.get("dailyLimitMinutes", (data) => {
			let dailyLimit = data.dailyLimitMinutes;
			percentage = Math.round((totalTime / (dailyLimit * 60)) * 100);

			if (percentage <= 25) {
				insult =
					SNARK_DB.TIER_LOW[
						Math.floor(Math.random() * SNARK_DB.TIER_LOW.length)
					];
			} else if (percentage <= 50) {
				insult =
					SNARK_DB.TIER_MID[
						Math.floor(Math.random() * SNARK_DB.TIER_MID.length)
					];
			} else if (percentage <= 75) {
				insult =
					SNARK_DB.TIER_HIGH[
						Math.floor(Math.random() * SNARK_DB.TIER_HIGH.length)
					];
			} else if (percentage <= 99) {
				insult =
					SNARK_DB.TIER_CRITICAL[
						Math.floor(Math.random() * SNARK_DB.TIER_CRITICAL.length)
					];
			} else {
				insult =
					SNARK_DB.TIER_BLOCKED[
						Math.floor(Math.random() * SNARK_DB.TIER_BLOCKED.length)
					];
			}

			if (isHomepage()) {
				const injectedYtElement = document.getElementById("voidtube-dashboard");
				if (!injectedYtElement) {
					createDashboard(percentage, insult);
				} else {
					updateDashboard(percentage, insult);
				}
			}
		});
	});
}

// Initial call
VoidtubeDashboard();

// Navigation Polling to handle SPA
// Navigation Polling to handle SPA
setInterval(() => {
	const dashboard = document.getElementById("voidtube-dashboard");
	const isHome =
		location.hostname === "www.youtube.com" && location.pathname === "/";

	if (dashboard && !isHome) {
		dashboard.remove(); // Remove if left homepage
	} else if (!dashboard && isHome) {
		VoidtubeDashboard(); // Create dashboard on homepage
	}
	// Don't refresh while on homepage - let the data update naturally
}, 2000); // Longer interval, just for navigation detection
