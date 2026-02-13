// Listens for messages sent from other parts of the extension (e.g., content scripts)
const MIN_SESSION_SECONDS = 2;
const NO_LIMIT_MODE_KEY = "noLimitModeEnabled";
const RAW_RETENTION_DAYS = 5;
const EXPORT_PREFIX = "weeklyExport:";
const MAINTENANCE_LAST_RUN_KEY = "__vt_maintenance_last_run__";
const MAINTENANCE_INTERVAL_MS = 6 * 60 * 60 * 1000;

let maintenanceRunning = false;

function getTodayDateUtc() {
	return new Date().toISOString().split("T")[0];
}

function isDayKey(key) {
	return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

function parseDayKeyUtc(dayKey) {
	return new Date(`${dayKey}T00:00:00.000Z`);
}

function formatDayKeyUtc(date) {
	return date.toISOString().split("T")[0];
}

function getDayAge(dayKey, todayDayKey) {
	const dayMs = parseDayKeyUtc(dayKey).getTime();
	const todayMs = parseDayKeyUtc(todayDayKey).getTime();
	return Math.floor((todayMs - dayMs) / (24 * 60 * 60 * 1000));
}

function getWeekRangeForDay(dayKey) {
	const date = parseDayKeyUtc(dayKey);
	const weekday = date.getUTCDay(); // Sunday=0 ... Saturday=6
	const diffToMonday = (weekday + 6) % 7;

	const start = new Date(date);
	start.setUTCDate(start.getUTCDate() - diffToMonday);

	const end = new Date(start);
	end.setUTCDate(start.getUTCDate() + 6);

	return [formatDayKeyUtc(start), formatDayKeyUtc(end)];
}

function runMaintenance() {
	if (maintenanceRunning) return;
	maintenanceRunning = true;

	const done = () => {
		maintenanceRunning = false;
	};

	chrome.storage.local.get(null, (allData) => {
		const todayDayKey = getTodayDateUtc();
		const allDayKeys = Object.keys(allData).filter(isDayKey).sort();
		const eligibleDayKeys = allDayKeys.filter(
			(dayKey) => getDayAge(dayKey, todayDayKey) >= RAW_RETENTION_DAYS,
		);

		if (eligibleDayKeys.length === 0) {
			chrome.storage.local.set({ [MAINTENANCE_LAST_RUN_KEY]: Date.now() }, done);
			return;
		}

		const groupedByWeek = new Map();
		for (const dayKey of eligibleDayKeys) {
			const [weekStart, weekEnd] = getWeekRangeForDay(dayKey);
			const exportKey = `${EXPORT_PREFIX}${weekStart}_to_${weekEnd}`;
			const existing = groupedByWeek.get(exportKey) || [];
			existing.push(dayKey);
			groupedByWeek.set(exportKey, existing);
		}

		const exportsToWrite = {};
		for (const [exportKey, dayKeys] of groupedByWeek.entries()) {
			const newSourceDates = [...dayKeys].sort();
			const existingExport = allData[exportKey];
			const mergedByDate = new Map();

			if (
				existingExport &&
				Array.isArray(existingExport.dailyRecords)
			) {
				for (const row of existingExport.dailyRecords) {
					if (!row || typeof row.date !== "string") continue;
					mergedByDate.set(row.date, {
						date: row.date,
						totalTimeSeconds: Number(row.totalTimeSeconds) || 0,
						session: Array.isArray(row.session) ? row.session : [],
					});
				}
			}

			for (const dayKey of newSourceDates) {
				const record = allData[dayKey] || {};
				const sessions = Array.isArray(record.session) ? record.session : [];
				const daySeconds = Number(record.totalTimeSeconds) || 0;
				mergedByDate.set(dayKey, {
					date: dayKey,
					totalTimeSeconds: daySeconds,
					session: sessions,
				});
			}

			const dailyRecords = [...mergedByDate.values()].sort((a, b) =>
				a.date.localeCompare(b.date),
			);

			const sourceDates = dailyRecords.map((row) => row.date);
			const totalTimeSeconds = dailyRecords.reduce(
				(acc, row) => acc + (Number(row.totalTimeSeconds) || 0),
				0,
			);
			const totalSessions = dailyRecords.reduce(
				(acc, row) => acc + (Array.isArray(row.session) ? row.session.length : 0),
				0,
			);

			const range = exportKey.replace(EXPORT_PREFIX, "");
			const [startDate, endDate] = range.split("_to_");
			exportsToWrite[exportKey] = {
				type: "weekly-export-v1",
				startDate,
				endDate,
				createdAt:
					typeof existingExport?.createdAt === "string"
						? existingExport.createdAt
						: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				sourceDates,
				totalTimeSeconds,
				totalSessions,
				dailyRecords,
			};
		}

		exportsToWrite[MAINTENANCE_LAST_RUN_KEY] = Date.now();
		chrome.storage.local.set(exportsToWrite, () => {
			chrome.storage.local.remove(eligibleDayKeys, done);
		});
	});
}

function maybeRunMaintenance(force = false) {
	if (maintenanceRunning) return;

	chrome.storage.local.get([MAINTENANCE_LAST_RUN_KEY], (meta) => {
		const lastRunAt = Number(meta[MAINTENANCE_LAST_RUN_KEY]) || 0;
		const shouldRun =
			force || Date.now() - lastRunAt >= MAINTENANCE_INTERVAL_MS;
		if (!shouldRun) return;
		runMaintenance();
	});
}

chrome.runtime.onInstalled.addListener(() => {
	maybeRunMaintenance(true);
});

chrome.runtime.onStartup.addListener(() => {
	maybeRunMaintenance(true);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	maybeRunMaintenance();

	// Get the current date in YYYY-MM-DD format to use as a key for daily storage
	let todayDate = getTodayDateUtc();
	// Set the daily limit from the user's preferences
	let limit = null; // must be in seconds

	// Check if the user has already exceeded their daily time limit
	if (message.action === "check-block-status") {
		const currentSessionElapsed = message.currentSessionElapsed || 0;
		chrome.storage.sync.get(["dailyLimitMinutes", NO_LIMIT_MODE_KEY], (data) => {
			if (data[NO_LIMIT_MODE_KEY]) {
				sendResponse({ blockYt: false });
				return;
			}

			limit = (data.dailyLimitMinutes || 30) * 60;

			chrome.storage.local.get([todayDate], (result) => {
				let exist = result[todayDate];

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
		const elapsed = Number(message.elapsed);
		const url = message.url;
		const creator = message.creator;
		const videoTitle = message.videoTitle;
		const hasRecordedMeta =
			typeof creator === "string" &&
			typeof videoTitle === "string" &&
			creator.trim() &&
			videoTitle.trim() &&
			creator !== "Not-Recorded" &&
			videoTitle !== "Not-Recorded";

		if (!Number.isFinite(elapsed) || elapsed <= 0) {
			sendResponse({ blockYt: false });
			return true;
		}

		// Ignore short preview bursts so they don't pollute stats.
		if (elapsed < MIN_SESSION_SECONDS) {
			sendResponse({ blockYt: false });
			return true;
		}

		chrome.storage.sync.get(["dailyLimitMinutes", NO_LIMIT_MODE_KEY], (data) => {
			const limit = (data.dailyLimitMinutes || 30) * 60;
			const noLimitMode = !!data[NO_LIMIT_MODE_KEY];
			chrome.storage.local.get([todayDate], (result) => {
				let exist = result[todayDate];

				if (!result || !exist) {
					// Initialize a new entry if this is the first log of the day
					exist = {
						date: todayDate,
						totalTimeSeconds: elapsed,
						session: [],
					};
				} else {
					// Increment total time and append the specific session details
					exist.totalTimeSeconds += elapsed;
				}

				if (!Array.isArray(exist.session)) {
					exist.session = [];
				}

				// Clean stale placeholders from previous runs.
				exist.session = exist.session.filter(
					(item) =>
						item &&
						typeof item.videoTitle === "string" &&
						typeof item.creator === "string" &&
						item.videoTitle !== "Not-Recorded" &&
						item.creator !== "Not-Recorded",
				);

				if (hasRecordedMeta) {
					exist.session.push({
						videoTitle: videoTitle,
						creator: creator,
						watchTime: elapsed,
						videoUrl: url,
					});
				}

				// Save the updated data back to local storage
				chrome.storage.local.set({ [todayDate]: exist });

					// Inform the sender if the new total has pushed the user over the limit
					if (!noLimitMode && exist.totalTimeSeconds > limit) {
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
