// analytics.js
console.log("=== analytics.js LOADED ===");

/**
 * sessions input example:
 * [{ creator: "Theo", watchTime: 13.4, ... }, ...]
 *
 * returns:
 * [{ creator, totalSeconds, timeString, percentage }, ...]
 */
window.getTopDealers = function getTopDealers(sessions, limit) {
	const totalsByCreator = new Map();

	for (let i = 0; i < sessions.length; i++) {
		const s = sessions[i];

		const creator =
			typeof s?.creator === "string" && s.creator.trim()
				? s.creator.trim()
				: "Unknown";

		const seconds =
			Number.isFinite(Number(s?.watchTime)) && Number(s.watchTime) > 0
				? Number(s.watchTime)
				: 0;

		totalsByCreator.set(creator, (totalsByCreator.get(creator) || 0) + seconds);
	}

	let grandTotalSeconds = 0;
	for (const seconds of totalsByCreator.values()) {
		grandTotalSeconds += seconds;
	}

	const rows = [...totalsByCreator.entries()]
		.map(([creator, totalSeconds]) => {
			const percentage =
				grandTotalSeconds > 0
					? Math.round((totalSeconds / grandTotalSeconds) * 100)
					: 0;

			return {
				creator,
				totalSeconds,
				timeString: formatDuration(totalSeconds),
				percentage,
			};
		})
		.sort((a, b) => b.totalSeconds - a.totalSeconds)
		.slice(0, limit);

	return rows;
};

function formatDuration(totalSeconds) {
	const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
	const hours = Math.floor(s / 3600);
	const minutes = Math.floor((s % 3600) / 60);
	const seconds = s % 60;

	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m ${seconds}s`;
	return `${seconds}s`;
}
