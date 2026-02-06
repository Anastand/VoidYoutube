// HELPER FUNCTIONS - MUST BE AT TOP LEVEL
function isHomepage() {
	return location.hostname === "www.youtube.com" && location.pathname === "/";
}

function getTodayDate() {
	return new Date().toISOString().split("T")[0];
}

const SNARK_DB = {
	TIER_LOW: [
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

function updateDashboard(percentage, insult) {
	const timeText = document.getElementById("vt-time-text");
	const barFill = document.getElementById("vt-bar-fill");
	const messageText = document.getElementById("vt-message");

	if (timeText) timeText.textContent = `${percentage}% WASTED`;
	if (barFill) barFill.style.width = `${Math.min(percentage, 100)}%`;
	if (messageText) messageText.textContent = insult;
}

function createDashboard(percentage, insult) {
	const dashboard = document.createElement("div");
	dashboard.id = "voidtube-dashboard";

	// Updated Container: Wider, brutalist layout
	dashboard.style.cssText = `
        width: 100%;
        max-width: 1000px;
        margin: 10px auto 10px auto;
        padding: 25px;
        background-color: #0a0a0a;
        border: 2px solid #ff0000;
        box-shadow: 0 0 25px rgba(255, 0, 0, 0.3);
        color: #fff;
        font-family: 'Courier New', monospace;
        // z-index: 9999;
        border-radius: 4px;
        box-sizing: border-box;
    `;

	dashboard.innerHTML = `
        <h1 id="vt-time-text" style="font-size: 42px; color: #ff0000; margin: 0 0 15px 0; text-align: left;">${percentage}% WASTED</h1>

        <div style="width: 100%; height: 8px; background: #222; margin-bottom: 20px; border-radius: 4px; overflow: hidden;">
            <div id="vt-bar-fill" style="width: ${Math.min(percentage, 100)}%; height: 100%; background: #ff0000; transition: width 0.5s ease-out;"></div>
        </div>

        <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 20px;">
            <!-- Message takes 3/4 space -->
            <p id="vt-message" style="flex: 3; color: #eee; font-size: 18px; margin: 0; text-align: left; line-height: 1.4; border-left: 3px solid #ff0000; padding-left: 15px;">
                ${insult}
            </p>

            <!-- Button takes 1/4 space and sits in the bottom corner -->
            <div style="flex: 1; text-align: right;">
                <button id="vt-sync-btn" style="background: transparent; border: 1px solid #ff0000; color: #ff0000; cursor: pointer; padding: 10px 20px; font-family: monospace; font-weight: bold; font-size: 14px; transition: all 0.2s ease;">
                    [ REFRESH_STATS ]
                </button>
            </div>
        </div>
    `;

	const browseContainer = document.querySelector(
		'ytd-browse[page-subtype="home"]',
	);
	if (browseContainer) {
		browseContainer.prepend(dashboard);
		document
			.getElementById("vt-sync-btn")
			.addEventListener("click", VoidtubeDashboard);

		// Add hover effect via JS since we aren't using an external CSS file for this part
		const btn = document.getElementById("vt-sync-btn");
		btn.onmouseover = () => {
			btn.style.background = "#ff0000";
			btn.style.color = "#fff";
		};
		btn.onmouseout = () => {
			btn.style.background = "transparent";
			btn.style.color = "#ff0000";
		};
	} else {
		document.body.appendChild(dashboard);
	}
}

function VoidtubeDashboard() {
	const todayDate = getTodayDate();

	chrome.storage.local.get([todayDate], (local) => {
		chrome.storage.sync.get("dailyLimitMinutes", (sync) => {
			const totalTime = local[todayDate]?.totalTimeSeconds || 0;
			const limitMinutes = sync.dailyLimitMinutes || 30;
			const limitSeconds = limitMinutes * 60;
			const percentage = Math.round((totalTime / limitSeconds) * 100);

			let tier;
			if (percentage <= 25) tier = SNARK_DB.TIER_LOW;
			else if (percentage <= 50) tier = SNARK_DB.TIER_MID;
			else if (percentage <= 75) tier = SNARK_DB.TIER_HIGH;
			else if (percentage <= 99) tier = SNARK_DB.TIER_CRITICAL;
			else tier = SNARK_DB.TIER_BLOCKED;

			const insult = tier[Math.floor(Math.random() * tier.length)];

			const existing = document.getElementById("voidtube-dashboard");
			if (existing) {
				updateDashboard(percentage, insult);
			} else {
				createDashboard(percentage, insult);
			}
		});
	});
}

function tryInject(retryCount = 0) {
	if (!isHomepage()) return;

	const container = document.querySelector('ytd-browse[page-subtype="home"]');
	if (container) {
		VoidtubeDashboard();
	} else if (retryCount < 30) {
		setTimeout(() => tryInject(retryCount + 1), 333);
	}
}

// NAVIGATION ENGINE
window.addEventListener("yt-navigate-finish", () => {
	const d = document.getElementById("voidtube-dashboard");
	if (!isHomepage()) {
		if (d) d.remove();
	} else {
		tryInject();
	}
});

// Initial run for landing/refresh
tryInject();
