// dashboard.js

// 1. HELPER FUNCTIONS - MUST BE AT TOP LEVEL
function isHomepage() {
	return location.hostname === "www.youtube.com" && location.pathname === "/";
}

function getTodayDate() {
	return new Date().toISOString().split("T")[0];
}
const NO_LIMIT_MODE_KEY = "noLimitModeEnabled";

function applyHomeSheetPreferences() {
	if (!document.body) return;

	chrome.storage.sync.get(["homeSheetHidden", "homeSheetBlurred"], (prefs) => {
		const hide = !!prefs.homeSheetHidden;
		const blur = !!prefs.homeSheetBlurred;

		document.body.classList.toggle("vt-home-hide", hide);
		document.body.classList.toggle("vt-home-blur", blur);
	});
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
function updateDashboard(percentage, insult, limitMinutes, noLimitMode) {
	const timeText = document.getElementById("vt-time-text");
	const barFill = document.getElementById("vt-bar-fill");
	const messageText = document.getElementById("vt-message");
	const limitDisplay = document.getElementById("vt-sync-currentLimit");
	const modeBadge = document.getElementById("vt-mode-badge");

	if (timeText) {
		timeText.textContent = noLimitMode
			? `${percentage}% LOGGED`
			: `${percentage}% WASTED`;
	}
	if (barFill) barFill.style.width = `${Math.min(percentage, 100)}%`;
	if (messageText) messageText.textContent = insult;
	if (limitDisplay) limitDisplay.textContent = `LIMIT: ${limitMinutes}m`;
	if (modeBadge) {
		modeBadge.textContent = noLimitMode ? "VOID MODE: ON" : "VOID MODE: OFF";
		modeBadge.style.background = noLimitMode ? "#ff0000" : "transparent";
		modeBadge.style.color = noLimitMode ? "#fff" : "#ff0000";
	}
}

function isDealersVisible() {
	const container = document.getElementById("vt-dealers-container");
	return !!container && container.style.display !== "none";
}

function refreshDashboardNow() {
	const button = document.getElementById("vt-sync-btn");
	if (button) {
		button.textContent = "[ REFRESHING... ]";
		button.disabled = true;
	}

	VoidtubeDashboard();

	if (button) {
		setTimeout(() => {
			button.textContent = "[ REFRESH_STATS ]";
			button.disabled = false;
		}, 300);
	}
}

// 3. CREATOR FUNCTION
function createDashboard(percentage, insult, limitMinutes, noLimitMode) {
	const dashboard = document.createElement("div");
	dashboard.id = "voidtube-dashboard";

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
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-bottom: 10px;">
            <h1 id="vt-time-text" style="font-size: 72px; color: #ff0000; margin: 0; letter-spacing: -2px; font-weight: 900;">
                ${noLimitMode ? `${percentage}% LOGGED` : `${percentage}% WASTED`}
            </h1>
            <div id="vt-mode-badge" style="border:1px solid #ff0000; padding:8px 10px; font-size:12px; font-weight:700; color:${noLimitMode ? "#fff" : "#ff0000"}; background:${noLimitMode ? "#ff0000" : "transparent"};">
                ${noLimitMode ? "VOID MODE: ON" : "VOID MODE: OFF"}
            </div>
        </div>

        <div style="width: 100%; height: 15px; background: #222; margin-bottom: 35px; overflow: hidden;">
            <div id="vt-bar-fill" style="width: ${Math.min(percentage, 100)}%; height: 100%; background: #ff0000; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div>
        </div>

        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 40px;">
            <p id="vt-message" style="flex: 3; color: #fff; font-size: 22px; margin: 0; line-height: 1.2; font-weight: bold; text-transform: uppercase;">
                ${insult}
            </p>

            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 15px;">
                <button id="vt-sync-btn" style="background: transparent; border: 2px solid #ff0000; color: #ff0000; cursor: pointer; padding: 10px 20px; font-family: monospace; font-weight: 900; font-size: 14px;">
                    [ REFRESH_STATS ]
                </button>

                <button id="vt-toggle-dealers" style="background: transparent; border: 2px solid #ff0000; color: #ff0000; cursor: pointer; padding: 10px 20px; font-family: monospace; font-weight: 900; font-size: 14px;">
                    [ SHOW_DEALERS ]
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

        <div id="vt-dealers-container" style="display: none; margin-top: 30px;">
            <table id="vt-dealers-table" style="width: 100%; border-collapse: collapse; font-family: 'Courier New', monospace;">
                <thead>
                    <tr style="border-bottom: 2px solid #ff0000;">
                        <th style="text-align: left; padding: 10px; color: #ff0000; font-size: 14px; text-transform: uppercase;">CREATOR</th>
                        <th style="text-align: right; padding: 10px; color: #ff0000; font-size: 14px; text-transform: uppercase;">TIME</th>
                        <th style="text-align: right; padding: 10px; color: #ff0000; font-size: 14px; text-transform: uppercase;">%</th>
                    </tr>
                </thead>
                <tbody id="vt-dealers-tbody"></tbody>
            </table>
        </div>
    `;

	const browseContainer = document.querySelector(
		'ytd-browse[page-subtype="home"]',
	);
	if (!browseContainer) return;

	browseContainer.prepend(dashboard);

	document
		.getElementById("vt-sync-btn")
		.addEventListener("click", refreshDashboardNow);

	document
		.getElementById("vt-toggle-dealers")
		.addEventListener("click", toggleDealers);

	document.getElementById("vt-limit-button").addEventListener("click", () => {
		const raw = document.getElementById("vt-limit-input").value;
		const val = parseInt(raw, 10);

		if (Number.isFinite(val) && val > 0) {
			chrome.storage.sync.set({ dailyLimitMinutes: val }, () => {
				VoidtubeDashboard();
			});
		}
	});
}

// toggle Function
function toggleDealers() {
	const container = document.getElementById("vt-dealers-container");
	const button = document.getElementById("vt-toggle-dealers");

	if (!container || !button) return;

	const isVisible = container.style.display !== "none";

	if (isVisible) {
		container.style.display = "none";
		button.textContent = "[ SHOW_DEALERS ]";
	} else {
		container.style.display = "block";
		button.textContent = "[ HIDE_DEALERS ]";
		renderDealersTable();
	}
}

// renderDealersTable
function renderDealersTable() {
	const tbody = document.getElementById("vt-dealers-tbody");
	if (!tbody) return;

	tbody.innerHTML = "";

	const todayDate = getTodayDate();
	chrome.storage.local.get([todayDate], (local) => {
		const sessions = local[todayDate]?.session || [];

		const dealers = getTopDealers(sessions, 5);

		if (!dealers || dealers.length === 0) {
			tbody.innerHTML = `
				<tr>
					<td colspan="3" style="padding: 20px; color: #666; text-align: center;">
						NO DATA YET. START WASTING TIME FIRST.
					</td>
				</tr>
			`;
			return;
		}

		dealers.forEach((dealer, index) => {
			const row = document.createElement("tr");
			row.style.cssText = `border-bottom: 1px solid #222;`;

			row.innerHTML = `
				<td style="padding: 12px 10px; color: #fff; font-size: 14px;">
					${index + 1}. ${dealer.creator}
				</td>
				<td style="padding: 12px 10px; color: #aaa; font-size: 14px; text-align: right;">
					${dealer.timeString}
				</td>
				<td style="padding: 12px 10px; color: #ff0000; font-size: 14px; text-align: right; font-weight: bold;">
					${dealer.percentage}%
				</td>
			`;

			tbody.appendChild(row);
		});
	});
}

// 4. CONTROLLER FUNCTION
function VoidtubeDashboard() {
	const todayDate = getTodayDate();

	chrome.storage.local.get([todayDate], (local) => {
		chrome.storage.sync.get(["dailyLimitMinutes", NO_LIMIT_MODE_KEY], (sync) => {
			const totalTime = local[todayDate]?.totalTimeSeconds || 0;
			const limitMinutes = sync.dailyLimitMinutes || 30;
			const limitSeconds = limitMinutes * 60;
			const noLimitMode = !!sync[NO_LIMIT_MODE_KEY];

			const percentage =
				limitSeconds > 0 ? Math.round((totalTime / limitSeconds) * 100) : 0;

			let tier;
			if (noLimitMode) {
				tier = [
					"Void Mode active. No blocking now. Every second is still being logged.",
				];
			} else if (percentage <= 25) tier = SNARK_DB.TIER_LOW;
			else if (percentage <= 50) tier = SNARK_DB.TIER_MID;
			else if (percentage <= 75) tier = SNARK_DB.TIER_HIGH;
			else if (percentage <= 99) tier = SNARK_DB.TIER_CRITICAL;
			else tier = SNARK_DB.TIER_BLOCKED;

			const insult = tier[Math.floor(Math.random() * tier.length)];

			const existing = document.getElementById("voidtube-dashboard");
			if (!isHomepage()) return;

			if (existing) {
				updateDashboard(percentage, insult, limitMinutes, noLimitMode);
			} else {
				createDashboard(percentage, insult, limitMinutes, noLimitMode);
			}

			if (isDealersVisible()) {
				renderDealersTable();
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
	applyHomeSheetPreferences();

	const d = document.getElementById("voidtube-dashboard");
	if (!isHomepage()) {
		if (d) d.remove();
	} else {
		tryInject();
	}
});

chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName !== "sync") return;
	if (
		!changes.homeSheetHidden &&
		!changes.homeSheetBlurred &&
		!changes[NO_LIMIT_MODE_KEY]
	)
		return;
	applyHomeSheetPreferences();
	if (isHomepage()) {
		VoidtubeDashboard();
	}
});

// Initial load
applyHomeSheetPreferences();
tryInject();
