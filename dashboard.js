// 1. HELPER FUNCTIONS - MUST BE AT TOP LEVEL
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
		"The bar was on the floor and you brought a shovel.",
		"Your ambition is a ghost town.",
		"Starting the day with a deficit? Classic you.",
		"You’re like a software update that everyone ignores.",
		"Just a reminder: 'Later' is where dreams go to die.",
	],
	TIER_MID: [
		"Halfway through the day and you’ve achieved... absolutely nothing.",
		"Your potential is currently a rounded zero. Impressive, in a sad way.",
		"Are you waiting for an award for 'Most Consistent Time-Waster'?",
		"The 'Recommended' section is your tombstone. Keep digging.",
		"You’re working hard at being completely useless.",
		"Even a broken clock is right twice; you’re just wrong 24/7.",
		"Is that another cat video, or just your brain melting in real-time?",
		"If procrastination paid, you'd be a billionaire. But it doesn't.",
		"You have the work ethic of a decorative pillow.",
		"Your life is a 'Before' picture with no 'After' in sight.",
	],
	TIER_HIGH: [
		"The sun is setting on your productivity and your dignity.",
		"You’re not 'decompressing,' you’re decomposing.",
		"Imagine if you put 10% of this effort into something that paid bills.",
		"At this rate, your resume is just going to be a link to your watch history.",
		"The light at the end of the tunnel is just another video you shouldn't watch.",
		"Tick tock. That’s the sound of your opportunities evaporating.",
		"Is it hard being this consistently pathetic, or does it come naturally?",
		"Your future self is currently screaming at you. Can you hear it?",
		"You’re like a library book that’s 10 years overdue. Useless.",
		"Do you ever get tired of being your own worst enemy?",
	],
	TIER_CRITICAL: [
		"Drowning in the void, and you're asking for more water.",
		"The smell of wasted potential is getting really offensive now.",
		"Is this your legacy? A thumb-callus and a dry brain?",
		"Close the tab. Or don't. At this point, failure is your brand.",
		"You’ve successfully converted another day into pure garbage.",
		"The only thing you've finished today is your battery life.",
		"You’re one video away from complete mental atrophy.",
		"Congratulations, you’ve hit rock bottom. Want a shovel?",
		"Your life is a cautionary tale for people with actual goals.",
		"The abyss isn't staring back, it's laughing at you.",
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
		"You are a black hole of productivity.",
		"Final warning: Get a life or get out of mine.",
	],
};

// 2. UPDATER FUNCTION
function updateDashboard(percentage, insult, limitMinutes) {
	const timeText = document.getElementById("vt-time-text");
	const barFill = document.getElementById("vt-bar-fill");
	const messageText = document.getElementById("vt-message");
	const limitDisplay = document.getElementById("vt-sync-currentLimit");

	if (timeText) timeText.textContent = `${percentage}% WASTED`;
	if (barFill) barFill.style.width = `${Math.min(percentage, 100)}%`;
	if (messageText) messageText.textContent = insult;
	if (limitDisplay) limitDisplay.textContent = `LIMIT: ${limitMinutes}m`;
}

// 3. CREATOR FUNCTION
function createDashboard(percentage, insult, limitMinutes) {
	const dashboard = document.createElement("div");
	dashboard.id = "voidtube-dashboard";

	// Brutalist styling - Center-aligned, full width maxed at 1100px
	dashboard.style.cssText = `
        width: 100%;
        max-width: 1100px;
        margin: 0 auto 40px auto;
        padding: 40px;
        background-color: #050505;
        border-bottom: 4px solid #ff0000;
        color: #fff;
        font-family: 'Courier New', monospace;
        box-sizing: border-box;
        text-align: left;
    `;

	dashboard.innerHTML = `
        <h1 id="vt-time-text" style="font-size: 72px; color: #ff0000; margin: 0 0 10px 0; letter-spacing: -2px; font-weight: 900;">
            ${percentage}% WASTED
        </h1>

        <div style="width: 100%; height: 15px; background: #222; margin-bottom: 35px; overflow: hidden;">
            <div id="vt-bar-fill" style="width: ${Math.min(percentage, 100)}%; height: 100%; background: #ff0000; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div>
        </div>

        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 40px;">
            <!-- Message takes 3/4 space -->
            <p id="vt-message" style="flex: 3; color: #fff; font-size: 22px; margin: 0; line-height: 1.2; font-weight: bold; text-transform: uppercase;">
                ${insult}
            </p>

            <!-- Controls take 1/4 space -->
            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 15px;">
                <button id="vt-sync-btn" style="background: transparent; border: 2px solid #ff0000; color: #ff0000; cursor: pointer; padding: 10px 20px; font-family: monospace; font-weight: 900; font-size: 14px;">
                    [ REFRESH_STATS ]
                </button>

                <div style="border: 1px solid #333; padding: 15px; background: #111; width: 220px; box-sizing: border-box;">
                    <p id="vt-sync-currentLimit" style="font-size: 12px; margin: 0 0 8px 0; color: #aaa; font-weight: bold;">LIMIT: ${limitMinutes}m</p>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" id="vt-limit-input" placeholder="MIN" style="width: 70px; background: #000; border: 1px solid #ff0000; color: #fff; font-family: monospace; padding: 5px;">
                        <button id="vt-limit-button" style="background: #ff0000; border: none; color: #fff; cursor: pointer; padding: 5px 15px; font-family: monospace; font-weight: bold; flex-grow: 1;">SET</button>
                    </div>
                </div>
            </div>
        </div>
    `;

	const browseContainer = document.querySelector(
		'ytd-browse[page-subtype="home"]',
	);
	if (browseContainer) {
		browseContainer.prepend(dashboard);

		// Listeners
		document
			.getElementById("vt-sync-btn")
			.addEventListener("click", VoidtubeDashboard);
		document.getElementById("vt-limit-button").addEventListener("click", () => {
			const val = parseInt(document.getElementById("vt-limit-input").value);
			if (val > 0) {
				chrome.storage.sync.set({ dailyLimitMinutes: val }, () => {
					VoidtubeDashboard(); // Re-render immediately
				});
			}
		});
	}
}

// 4. CONTROLLER FUNCTION
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
			if (isHomepage()) {
				if (existing) {
					updateDashboard(percentage, insult, limitMinutes);
				} else {
					createDashboard(percentage, insult, limitMinutes);
				}
			}
		});
	});
}

// 5. NAVIGATION & INJECTION ENGINE
function tryInject(retryCount = 0) {
	if (!isHomepage()) return;

	const container = document.querySelector('ytd-browse[page-subtype="home"]');
	if (container) {
		VoidtubeDashboard();
	} else if (retryCount < 30) {
		setTimeout(() => tryInject(retryCount + 1), 333);
	}
}

window.addEventListener("yt-navigate-finish", () => {
	const d = document.getElementById("voidtube-dashboard");
	if (!isHomepage()) {
		if (d) d.remove();
	} else {
		tryInject();
	}
});

// Initial load
tryInject();
