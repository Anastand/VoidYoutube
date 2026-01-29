chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message received in background.js", message);
  if (message.action === "log-watch-time") {
    const elapsed = message.elapsed;
    const url = message.url;
    const todayDate = new Date().toISOString().split("T")[0];
    chrome.storage.local.get([todayDate], (result) => {
      let exist = result[todayDate];
      if (!result || !exist) {
        exist = {
          date: todayDate,
          totalTimeSeconds: elapsed,
          session: [{ videoUrl: url, watchTime: elapsed }],
        };
      } else {
        exist.totalTimeSeconds += elapsed;
        exist.session.push({
          videoUrl: url,
          watchTime: elapsed,
        });
      }
      chrome.storage.local.set({ [todayDate]: exist });

      if (exist.totalTimeSeconds > 112) {
        sendResponse({ blockYt: true });
      } else {
        sendResponse({ blockYt: false });
      }
    });
    return true;
  }
});
