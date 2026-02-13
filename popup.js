const DEFAULT_LIMIT_MINUTES = 30;
const EXPORT_PREFIX = "weeklyExport:";
const NO_LIMIT_MODE_KEY = "noLimitModeEnabled";

function isDayKey(key) {
	return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

function getTodayDayKeyUtc() {
	return new Date().toISOString().split("T")[0];
}

function formatSeconds(totalSeconds) {
	const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	if (h > 0) return `${h}h ${m}m ${sec}s`;
	if (m > 0) return `${m}m ${sec}s`;
	return `${sec}s`;
}

function aggregateCreatorTime(sessions) {
	const totals = new Map();
	for (const session of sessions) {
		const creator =
			typeof session?.creator === "string" && session.creator.trim()
				? session.creator.trim()
				: "Unknown";
		const watchTime = Number(session?.watchTime) || 0;
		totals.set(creator, (totals.get(creator) || 0) + watchTime);
	}
	return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

function aggregateVideoTime(sessions) {
	const totals = new Map();
	for (const session of sessions) {
		const title =
			typeof session?.videoTitle === "string" && session.videoTitle.trim()
				? session.videoTitle.trim()
				: "Untitled";
		const creator =
			typeof session?.creator === "string" && session.creator.trim()
				? session.creator.trim()
				: "Unknown";
		const key = `${title}||${creator}`;
		const watchTime = Number(session?.watchTime) || 0;

		if (!totals.has(key)) {
			totals.set(key, {
				title,
				creator,
				totalSeconds: 0,
				url: session?.videoUrl || "",
			});
		}

		const row = totals.get(key);
		row.totalSeconds += watchTime;
		if (!row.url && session?.videoUrl) {
			row.url = session.videoUrl;
		}
	}

	return [...totals.values()].sort((a, b) => b.totalSeconds - a.totalSeconds);
}

function buildAiInstruction(dayOrWeek) {
	if (dayOrWeek === "week") {
		return [
			"Analyze the user's week from the data below and give a brutally honest review.",
			"Identify repeated waste patterns, highest-risk creators/videos, and concrete corrections for next week.",
			"Use direct language, no sugarcoating, and include clear action items.",
		];
	}

	return [
		"Analyze the user's day from the data below and give a brutally honest review.",
		"Focus on time waste patterns, impulsive behavior, creator/video concentration, and what must change tomorrow.",
		"Use direct language, no sugarcoating, and include clear action items.",
	];
}

function buildDayMarkdown(dayKey, record, limitMinutes) {
	const sessions = Array.isArray(record?.session) ? record.session : [];
	const totalSeconds = Number(record?.totalTimeSeconds) || 0;
	const creatorTotals = aggregateCreatorTime(sessions);
	const videoTotals = aggregateVideoTime(sessions);

	const lines = [];
	lines.push("# Instruction To AI");
	for (const line of buildAiInstruction("day")) {
		lines.push(`- ${line}`);
	}
	lines.push("");
	lines.push("# VoidTube Daily Export");
	lines.push("");
	lines.push(`- Date: ${dayKey}`);
	lines.push(`- Generated At: ${new Date().toISOString()}`);
	lines.push(`- Total Watch Time: ${formatSeconds(totalSeconds)}`);
	lines.push(`- Session Count: ${sessions.length}`);
	lines.push(`- Limit Minutes: ${limitMinutes}`);
	lines.push("");
	lines.push("## Creators Watched");
	if (creatorTotals.length === 0) {
		lines.push("No creator rows available.");
	} else {
		creatorTotals.forEach(([creator, secs], idx) => {
			lines.push(`${idx + 1}. ${creator} | ${formatSeconds(secs)}`);
		});
	}
	lines.push("");
	lines.push("## Videos Watched");
	if (videoTotals.length === 0) {
		lines.push("No video rows available.");
	} else {
		videoTotals.forEach((video, idx) => {
			lines.push(
				`${idx + 1}. ${video.title} | ${video.creator} | ${formatSeconds(video.totalSeconds)} | ${video.url || ""}`,
			);
		});
	}
	lines.push("");
	lines.push("## Session-Level Rows");
	if (sessions.length === 0) {
		lines.push("No session rows available.");
	} else {
		sessions.forEach((session, idx) => {
			lines.push(
				`${idx + 1}. ${session.videoTitle || "Untitled"} | ${session.creator || "Unknown"} | ${formatSeconds(session.watchTime)} | ${session.videoUrl || ""}`,
			);
		});
	}

	return lines.join("\n");
}

function buildWeeklyMarkdown(exportKey, record) {
	const dailyRecords = Array.isArray(record?.dailyRecords) ? record.dailyRecords : [];
	const totalSeconds = Number(record?.totalTimeSeconds) || 0;
	const totalSessions = Number(record?.totalSessions) || 0;
	const weeklySessions = [];

	for (const day of dailyRecords) {
		const daySessions = Array.isArray(day?.session) ? day.session : [];
		weeklySessions.push(...daySessions);
	}

	const creatorTotals = aggregateCreatorTime(weeklySessions);
	const videoTotals = aggregateVideoTime(weeklySessions);

	const lines = [];
	lines.push("# Instruction To AI");
	for (const line of buildAiInstruction("week")) {
		lines.push(`- ${line}`);
	}
	lines.push("");
	lines.push("# VoidTube Weekly Export");
	lines.push("");
	lines.push(`- Export Key: ${exportKey}`);
	lines.push(`- Start Date: ${record?.startDate || "N/A"}`);
	lines.push(`- End Date: ${record?.endDate || "N/A"}`);
	lines.push(`- Generated At: ${record?.createdAt || new Date().toISOString()}`);
	lines.push(`- Total Watch Time: ${formatSeconds(totalSeconds)}`);
	lines.push(`- Total Sessions: ${totalSessions}`);
	lines.push("");
	lines.push("## Creators Watched");
	if (creatorTotals.length === 0) {
		lines.push("No creator rows available.");
	} else {
		creatorTotals.forEach(([creator, secs], idx) => {
			lines.push(`${idx + 1}. ${creator} | ${formatSeconds(secs)}`);
		});
	}
	lines.push("");
	lines.push("## Videos Watched");
	if (videoTotals.length === 0) {
		lines.push("No video rows available.");
	} else {
		videoTotals.forEach((video, idx) => {
			lines.push(
				`${idx + 1}. ${video.title} | ${video.creator} | ${formatSeconds(video.totalSeconds)} | ${video.url || ""}`,
			);
		});
	}
	lines.push("");
	lines.push("## Daily Breakdown");
	if (dailyRecords.length === 0) {
		lines.push("No daily rows available.");
	} else {
		dailyRecords.forEach((day, idx) => {
			const dayDate = day?.date || `day-${idx + 1}`;
			const daySeconds = Number(day?.totalTimeSeconds) || 0;
			const daySessions = Array.isArray(day?.session) ? day.session.length : 0;
			lines.push(
				`${idx + 1}. ${dayDate} | ${formatSeconds(daySeconds)} | ${daySessions} sessions`,
			);
		});
	}

	return lines.join("\n");
}

async function copyTextToClipboard(text) {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.style.position = "fixed";
	textarea.style.left = "-9999px";
	document.body.appendChild(textarea);
	textarea.select();
	document.execCommand("copy");
	textarea.remove();
}

document.addEventListener("DOMContentLoaded", () => {
	const input = document.getElementById("limit-input");
	const limitButton = document.getElementById("limit-button");
	const currentLimit = document.getElementById("currentLimit");
	const status = document.getElementById("status");

	const homeSheetButton = document.getElementById("toggle-home-sheet");
	const blurButton = document.getElementById("toggle-home-blur");
	const noLimitModeButton = document.getElementById("toggle-no-limit-mode");

	const exportTodayButton = document.getElementById("export-today-button");
	const exportButton = document.getElementById("export-button");
	const exportsSection = document.getElementById("exports-section");
	const exportsStatus = document.getElementById("exports-status");
	const exportsList = document.getElementById("exports-list");

	function setStatus(text, tone = "success") {
		status.textContent = text;
		if (tone === "error") {
			status.style.color = "#ff6b6b";
			return;
		}
		if (tone === "info") {
			status.style.color =
				getComputedStyle(document.documentElement)
					.getPropertyValue("--vt-muted")
					.trim() || "#cfcfcf";
			return;
		}
		status.style.color = "#7dff7d";
	}

	function renderToggleButton(button, isOn) {
		button.textContent = isOn ? "ON" : "OFF";
		if (isOn) {
			button.style.background = "var(--vt-accent)";
			button.style.color = "var(--vt-accent-contrast)";
		} else {
			button.style.background = "transparent";
			button.style.color = "var(--vt-accent)";
		}
	}

	function renderVoidModeButton(isOn) {
		if (!noLimitModeButton) return;
		noLimitModeButton.textContent = `LOG MODE: ${isOn ? "ON" : "OFF"}`;
		if (isOn) {
			noLimitModeButton.style.background = "var(--vt-accent)";
			noLimitModeButton.style.color = "var(--vt-accent-contrast)";
		} else {
			noLimitModeButton.style.background = "transparent";
			noLimitModeButton.style.color = "var(--vt-accent)";
		}
	}

	function updateLimitLabel(limitValue) {
		currentLimit.textContent = `Current Limit: ${limitValue} minutes`;
	}

	function getLimitValue(callback) {
		chrome.storage.sync.get(["dailyLimitMinutes"], (data) => {
			const limitValue = Number(data.dailyLimitMinutes) || DEFAULT_LIMIT_MINUTES;
			callback(limitValue);
		});
	}

	function loadSettings() {
		chrome.storage.sync.get(
			["dailyLimitMinutes", "homeSheetHidden", "homeSheetBlurred", NO_LIMIT_MODE_KEY],
			(data) => {
				const limitValue = Number(data.dailyLimitMinutes) || DEFAULT_LIMIT_MINUTES;
				updateLimitLabel(limitValue);
				renderToggleButton(homeSheetButton, !!data.homeSheetHidden);
				renderToggleButton(blurButton, !!data.homeSheetBlurred);
				renderVoidModeButton(!!data[NO_LIMIT_MODE_KEY]);
			},
		);
	}

	function buildExportCard(key, allData, limitMinutes) {
		const card = document.createElement("div");
		card.style.border = "1px solid var(--vt-card-border)";
		card.style.padding = "8px";
		card.style.marginBottom = "8px";
		card.style.background = "var(--vt-card-bg)";

		const title = document.createElement("div");
		title.textContent = key;
		title.style.fontSize = "11px";
		title.style.color = "var(--vt-text)";
		title.style.wordBreak = "break-all";
		title.style.marginBottom = "6px";
		card.appendChild(title);

		const meta = document.createElement("div");
		meta.style.fontSize = "10px";
		meta.style.color = "var(--vt-soft)";
		meta.style.marginBottom = "6px";
		if (isDayKey(key)) {
			const rec = allData[key] || {};
			const sec = Number(rec.totalTimeSeconds) || 0;
			const sessionCount = Array.isArray(rec.session) ? rec.session.length : 0;
			meta.textContent = `DAILY | ${formatSeconds(sec)} | ${sessionCount} sessions`;
		} else {
			const rec = allData[key] || {};
			const sec = Number(rec.totalTimeSeconds) || 0;
			const sessionCount = Number(rec.totalSessions) || 0;
			meta.textContent = `WEEKLY | ${formatSeconds(sec)} | ${sessionCount} sessions`;
		}
		card.appendChild(meta);

		const button = document.createElement("button");
		button.textContent = "COPY MARKDOWN";
		button.style.background = "transparent";
		button.style.border = "1px solid var(--vt-accent)";
		button.style.color = "var(--vt-accent)";
		button.style.padding = "6px 8px";
		button.style.fontSize = "10px";
		button.style.fontFamily = "'Courier New', monospace";
		button.style.fontWeight = "700";
		button.style.cursor = "pointer";
		button.addEventListener("click", async () => {
			try {
				let markdown = "";
				if (isDayKey(key)) {
					markdown = buildDayMarkdown(key, allData[key], limitMinutes);
				} else {
					markdown = buildWeeklyMarkdown(key, allData[key] || {});
				}
				await copyTextToClipboard(markdown);
				setStatus(`Copied markdown for ${key}.`);
			} catch (_error) {
				setStatus(`Failed to copy ${key}.`, "error");
			}
		});
		card.appendChild(button);

		return card;
	}

	function loadExports() {
		exportsStatus.textContent = "Loading keys...";
		exportsList.innerHTML = "";

		getLimitValue((limitMinutes) => {
			chrome.storage.local.get(null, (allData) => {
				const keys = Object.keys(allData)
					.filter((key) => isDayKey(key) || key.startsWith(EXPORT_PREFIX))
					.sort()
					.reverse();

				if (keys.length === 0) {
					exportsStatus.textContent = "No daily/weekly export keys found.";
					return;
				}

				const dayCount = keys.filter(isDayKey).length;
				const weeklyCount = keys.length - dayCount;
				exportsStatus.textContent = `${keys.length} key(s): ${dayCount} daily, ${weeklyCount} weekly`;

				for (const key of keys) {
					exportsList.appendChild(buildExportCard(key, allData, limitMinutes));
				}
			});
		});
	}

	limitButton.addEventListener("click", () => {
		const value = parseInt(input.value, 10);
		if (!Number.isFinite(value) || value <= 0) {
			setStatus("Enter a valid positive minute value.", "error");
			return;
		}

		chrome.storage.sync.set({ dailyLimitMinutes: value }, () => {
			updateLimitLabel(value);
			setStatus("Limit saved.");
		});
	});

	homeSheetButton.addEventListener("click", () => {
		chrome.storage.sync.get(["homeSheetHidden"], (data) => {
			const nextValue = !data.homeSheetHidden;
			chrome.storage.sync.set({ homeSheetHidden: nextValue }, () => {
				renderToggleButton(homeSheetButton, nextValue);
				setStatus(`Home Sheet Blocker ${nextValue ? "ON" : "OFF"}.`);
			});
		});
	});

	blurButton.addEventListener("click", () => {
		chrome.storage.sync.get(["homeSheetBlurred"], (data) => {
			const nextValue = !data.homeSheetBlurred;
			chrome.storage.sync.set({ homeSheetBlurred: nextValue }, () => {
				renderToggleButton(blurButton, nextValue);
				setStatus(`Blur Home ${nextValue ? "ON" : "OFF"}.`);
			});
		});
	});

	if (noLimitModeButton) {
		noLimitModeButton.addEventListener("click", () => {
			chrome.storage.sync.get([NO_LIMIT_MODE_KEY], (data) => {
				const nextValue = !data[NO_LIMIT_MODE_KEY];
				chrome.storage.sync.set({ [NO_LIMIT_MODE_KEY]: nextValue }, () => {
					renderVoidModeButton(nextValue);
					setStatus(
						nextValue
							? "LOG MODE ON: Now just logging your activity."
							: "LOG MODE OFF: Void mode deactivated, enforcement is active.",
					);
				});
			});
		});
	}

	exportTodayButton.addEventListener("click", () => {
		const todayKey = getTodayDayKeyUtc();
		chrome.storage.local.get([todayKey], (dayData) => {
			const record = dayData[todayKey];
			if (!record) {
				setStatus(`No data for ${todayKey}.`, "info");
				return;
			}

			getLimitValue(async (limitMinutes) => {
				try {
					const markdown = buildDayMarkdown(todayKey, record, limitMinutes);
					await copyTextToClipboard(markdown);
					setStatus(`Copied markdown for today (${todayKey}).`);
				} catch (_error) {
					setStatus("Failed to copy today's markdown.", "error");
				}
			});
		});
	});

	exportButton.addEventListener("click", () => {
		const hidden = exportsSection.style.display === "none";
		exportsSection.style.display = hidden ? "block" : "none";
		exportButton.textContent = hidden
			? "HIDE EXPORT KEYS"
			: "SHOW ALL EXPORT KEYS";
		if (hidden) {
			loadExports();
		}
	});

	loadSettings();
});
