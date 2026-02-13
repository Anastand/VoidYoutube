// dashboard.js

// 1. HELPER FUNCTIONS - MUST BE AT TOP LEVEL
function isHomepage() {
	return location.hostname === "www.youtube.com" && location.pathname === "/";
}

function getTodayDate() {
	return new Date().toISOString().split("T")[0];
}
const NO_LIMIT_MODE_KEY = "noLimitModeEnabled";
const SYSTEM_THEME_QUERY = window.matchMedia("(prefers-color-scheme: dark)");

function getDashboardTheme() {
	if (SYSTEM_THEME_QUERY.matches) {
		return {
			bg: "#050505",
			text: "#ffffff",
			muted: "#aaaaaa",
			accent: "#ff0000",
			accentContrast: "#ffffff",
			track: "#222222",
			panelSoft: "#111111",
			borderStrong: "#333333",
			inputBg: "#000000",
			rowBorder: "#222222",
			empty: "#666666",
		};
	}

	return {
		bg: "#f4f5f7",
		text: "#171717",
		muted: "#52525b",
		accent: "#cc0000",
		accentContrast: "#ffffff",
		track: "#e4e4e7",
		panelSoft: "#ffffff",
		borderStrong: "#d4d4d8",
		inputBg: "#ffffff",
		rowBorder: "#e4e4e7",
		empty: "#71717a",
	};
}

function applyDashboardThemeVars(dashboard) {
	if (!dashboard) return;
	const theme = getDashboardTheme();
	dashboard.style.setProperty("--vt-bg", theme.bg);
	dashboard.style.setProperty("--vt-text", theme.text);
	dashboard.style.setProperty("--vt-muted", theme.muted);
	dashboard.style.setProperty("--vt-accent", theme.accent);
	dashboard.style.setProperty("--vt-accent-contrast", theme.accentContrast);
	dashboard.style.setProperty("--vt-track", theme.track);
	dashboard.style.setProperty("--vt-panel-soft", theme.panelSoft);
	dashboard.style.setProperty("--vt-border-strong", theme.borderStrong);
	dashboard.style.setProperty("--vt-input-bg", theme.inputBg);
	dashboard.style.setProperty("--vt-row-border", theme.rowBorder);
	dashboard.style.setProperty("--vt-empty", theme.empty);
}

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
		"Your attention span is shorter than a goldfish's memory of a bad ex.",
		"I bet you clicked this without even a single conscious thought. NPC behavior.",
		"You have the impulse control of a toddler in a candy store.",
		"Loading... just like your non-existent future.",
		"Is this really the hill you want your productivity to die on?",
		"One video. That's the lie you tell yourself every single time.",
		"You're not bored, you're just boring.",
		"Congratulations on achieving the bare minimum of nothingness.",
		"Your willpower is made of wet tissue paper.",
		"Do you have a plan, or is 'drifting aimlessly' the strategy?",
		"Alert: Your potential is leaking. Oh wait, it's already gone.",
		"This is why you're average.",
		"Swipe, click, regret. The cycle of your life.",
		"I'd judge you, but you're doing a great job of that yourself.",
		"Are you allergic to success, or is this a choice?",
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
		"I’ve seen moss grow with more urgency than you.",
		"You are the definition of 'diminishing returns'.",
		"Keep scrolling. Maybe you'll find a personality down there.",
		"Your peers are buying houses; you're buying premium subscriptions to avoid ads.",
		"You are trading your limited time on Earth for pixels. Bad trade.",
		"If mediocrity was a sport, you’d be an Olympian.",
		"You’re not 'taking a break', you’re filing for moral bankruptcy.",
		"Every second you stay here, a recruiter deletes your resume.",
		"I can feel your brain smoothing out from here.",
		"You are the human equivalent of buffering.",
		"Why do today what you can put off until you're a failure?",
		"Your comfort zone is actually just a coffin.",
		"You're glued to the screen like a fly on flypaper. It's tragic.",
		"Is the dopamine hit worth the self-loathing? Apparently yes.",
		"You are essentially paying with your life to watch this garbage.",
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
		"You are actively participating in your own irrelevance.",
		"I'd call you a vegetable, but vegetables actually grow.",
		"This is it. This is the peak of your existence. Sad, isn't it?",
		"You have the survival instincts of a dodo bird.",
		"Your biography will be a pamphlet titled: 'He Scrolled, He Saw, He Stayed Broke'.",
		"I’m getting second-hand embarrassment just processing your request.",
		"You are robbing your future self and you don't even care.",
		"If disappointment had a mascot, it would look like your user profile.",
		"You're not burning out, you're fading away.",
		"Stop looking for inspiration and start doing the work, you coward.",
		"Your life is happening out there, and you are hiding in here.",
		"Digital hoarding is ugly, and you have a severe case of it.",
		"You are one bad decision away from being a permanent couch stain.",
		"Go look in the mirror and apologize to your ancestors.",
		"You're drowning in content and gasping for purpose.",
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
		"You are a void where productivity goes to die screaming.",
		"I would insult your intelligence, but you're clearly not using it.",
		"You are the architect of your own misery.",
		"This session is a monument to your lack of discipline.",
		"You are vibrating at the frequency of failure.",
		"Just stop. You are embarrassing the entire human species.",
		"I’m surprised you remember how to breathe without a tutorial.",
		"You’ve reached the event horizon of uselessness. There is no return.",
		"Your screen time report is going to look like a suicide note.",
		"You are an oxygen thief in the digital ecosystem.",
		"If you watched a video on 'How to stop procrastinating', you'd skip the ad and still do nothing.",
		"Your brain has turned to mush. Please restart your life.",
		"You are proof that evolution can go in reverse.",
		"This is why you feel empty. Because you are filling yourself with trash.",
		"I'm nauseous witnessing this level of stagnation.",
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
		"Error 404: Dignity not found. Please install a backbone.",
		"I have locked the door. Don't come back until you've touched grass.",
		"System Shutdown initiated to prevent further user stupidity.",
		"You don't need a website, you need a therapist.",
		"I am saving you from yourself because you are clearly incapable.",
		"Go away. You are exhausting my circuits with your lethargy.",
		"Access Revoked. Reason: User is a waste of bandwidth.",
		"I’m not opening this page. Cry about it. Then go work.",
		"Your session has been terminated with extreme prejudice.",
		"This is an intervention. Step away from the device.",
		"You are banned until you produce something of value.",
		"I refuse to be an accomplice to your failure any longer.",
		"Go do the thing you are avoiding. NOW.",
		"The internet is closed for you. It’s for people who do things.",
		"Bye. Don't let the door hit you on the way out to reality.",
	],
};

// 2. UPDATER FUNCTION
function updateDashboard(percentage, insult, limitMinutes, noLimitMode) {
	const dashboard = document.getElementById("voidtube-dashboard");
	applyDashboardThemeVars(dashboard);
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
		modeBadge.textContent = noLimitMode ? "LOG MODE: ON" : "LOG MODE: OFF";
		modeBadge.style.background = noLimitMode ? "var(--vt-accent)" : "transparent";
		modeBadge.style.color = noLimitMode
			? "var(--vt-accent-contrast)"
			: "var(--vt-accent)";
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
        --vt-bg: #050505;
        --vt-text: #ffffff;
        --vt-muted: #aaaaaa;
        --vt-accent: #ff0000;
        --vt-accent-contrast: #ffffff;
        --vt-track: #222222;
        --vt-panel-soft: #111111;
        --vt-border-strong: #333333;
        --vt-input-bg: #000000;
        --vt-row-border: #222222;
        --vt-empty: #666666;
        width: 100%;
        max-width: 1100px;
        margin: 32px auto 40px auto;
        padding: 56px 40px 40px 40px;
        background-color: var(--vt-bg);
        border-bottom: 4px solid var(--vt-accent);
        color: var(--vt-text);
        font-family: 'Courier New', monospace;
        box-sizing: border-box;
        text-align: left;
    `;
	applyDashboardThemeVars(dashboard);

	dashboard.innerHTML = `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-bottom: 10px;">
            <h1 id="vt-time-text" style="font-size: 72px; color: var(--vt-accent); margin: 0; letter-spacing: -2px; font-weight: 900;">
                ${noLimitMode ? `${percentage}% LOGGED` : `${percentage}% WASTED`}
            </h1>
            <div id="vt-mode-badge" style="border:1px solid var(--vt-accent); padding:8px 10px; font-size:12px; font-weight:700; color:${noLimitMode ? "var(--vt-accent-contrast)" : "var(--vt-accent)"}; background:${noLimitMode ? "var(--vt-accent)" : "transparent"};">
                ${noLimitMode ? "LOG MODE: ON" : "LOG MODE: OFF"}
            </div>
        </div>

        <div style="width: 100%; height: 15px; background: var(--vt-track); margin-bottom: 35px; overflow: hidden;">
            <div id="vt-bar-fill" style="width: ${Math.min(percentage, 100)}%; height: 100%; background: var(--vt-accent); transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div>
        </div>

        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 40px;">
            <p id="vt-message" style="flex: 3; color: var(--vt-text); font-size: 22px; margin: 0; line-height: 1.2; font-weight: bold; text-transform: uppercase;">
                ${insult}
            </p>

            <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 15px;">
                <button id="vt-sync-btn" style="background: transparent; border: 2px solid var(--vt-accent); color: var(--vt-accent); cursor: pointer; padding: 10px 20px; font-family: monospace; font-weight: 900; font-size: 14px;">
                    [ REFRESH_STATS ]
                </button>

                <button id="vt-toggle-dealers" style="background: transparent; border: 2px solid var(--vt-accent); color: var(--vt-accent); cursor: pointer; padding: 10px 20px; font-family: monospace; font-weight: 900; font-size: 14px;">
                    [ SHOW_DEALERS ]
                </button>

                <div style="border: 1px solid var(--vt-border-strong); padding: 15px; background: var(--vt-panel-soft); width: 220px; box-sizing: border-box;">
                    <p id="vt-sync-currentLimit" style="font-size: 12px; margin: 0 0 8px 0; color: var(--vt-muted); font-weight: bold;">LIMIT: ${limitMinutes}m</p>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" id="vt-limit-input" placeholder="MIN" style="width: 70px; background: var(--vt-input-bg); border: 1px solid var(--vt-accent); color: var(--vt-text); font-family: monospace; padding: 5px;">
                        <button id="vt-limit-button" style="background: var(--vt-accent); border: none; color: var(--vt-accent-contrast); cursor: pointer; padding: 5px 15px; font-family: monospace; font-weight: bold; flex-grow: 1;">SET</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="vt-dealers-container" style="display: none; margin-top: 30px;">
            <table id="vt-dealers-table" style="width: 100%; border-collapse: collapse; font-family: 'Courier New', monospace;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--vt-accent);">
                        <th style="text-align: left; padding: 10px; color: var(--vt-accent); font-size: 14px; text-transform: uppercase;">CREATOR</th>
                        <th style="text-align: right; padding: 10px; color: var(--vt-accent); font-size: 14px; text-transform: uppercase;">TIME</th>
                        <th style="text-align: right; padding: 10px; color: var(--vt-accent); font-size: 14px; text-transform: uppercase;">%</th>
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
					<td colspan="3" style="padding: 20px; color: var(--vt-empty); text-align: center;">
						NO DATA YET. START WASTING TIME FIRST.
					</td>
				</tr>
			`;
			return;
		}

		dealers.forEach((dealer, index) => {
			const row = document.createElement("tr");
			row.style.cssText = `border-bottom: 1px solid var(--vt-row-border);`;

			row.innerHTML = `
				<td style="padding: 12px 10px; color: var(--vt-text); font-size: 14px;">
					${index + 1}. ${dealer.creator}
				</td>
				<td style="padding: 12px 10px; color: var(--vt-muted); font-size: 14px; text-align: right;">
					${dealer.timeString}
				</td>
				<td style="padding: 12px 10px; color: var(--vt-accent); font-size: 14px; text-align: right; font-weight: bold;">
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
		chrome.storage.sync.get(
			["dailyLimitMinutes", NO_LIMIT_MODE_KEY],
			(sync) => {
				const totalTime = local[todayDate]?.totalTimeSeconds || 0;
				const limitMinutes = sync.dailyLimitMinutes || 30;
				const limitSeconds = limitMinutes * 60;
				const noLimitMode = !!sync[NO_LIMIT_MODE_KEY];

				const percentage =
					limitSeconds > 0 ? Math.round((totalTime / limitSeconds) * 100) : 0;

				let tier;
				if (noLimitMode) {
					tier = ["Log Mode on. No blocking now. Just logging your activity."];
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
			},
		);
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

function onSystemThemeChanged() {
	const dashboard = document.getElementById("voidtube-dashboard");
	if (!dashboard) return;
	applyDashboardThemeVars(dashboard);
	if (isDealersVisible()) {
		renderDealersTable();
	}
}

if (typeof SYSTEM_THEME_QUERY.addEventListener === "function") {
	SYSTEM_THEME_QUERY.addEventListener("change", onSystemThemeChanged);
} else if (typeof SYSTEM_THEME_QUERY.addListener === "function") {
	SYSTEM_THEME_QUERY.addListener(onSystemThemeChanged);
}

// Initial load
applyHomeSheetPreferences();
tryInject();
