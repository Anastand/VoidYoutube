let video = document.querySelector("video");

// If video doesn't exist yet, keep checking
if (!video) {
  const checkInterval = setInterval(() => {
    video = document.querySelector("video");
    if (video) {
      clearInterval(checkInterval);
      attachListeners();
    }
  }, 100);
} else {
  attachListeners();
}

function attachListeners() {
  console.log("chwck");
  let startTime;
  let capExceeded = false;
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

    // Auto-remove after 3 seconds
    setTimeout(() => toast.remove(), 2500);
  }

  video.addEventListener("play", () => {
    console.log("PLAY EVENT FIRED");
    startTime = new Date();
    if (capExceeded) {
      video.pause();
      console.log("bro you exceeded your limit pls stop watching");
      return;
    }
  });

  video.addEventListener("pause", () => {
    console.log("PAUSE EVENT FIRED");

    if (!startTime) {
      console.log("Pause fired before play. Ignoring.");
      return;
    }
    const elapsed = (new Date() - startTime) / 1000;
    startTime = null;
    chrome.runtime.sendMessage(
      { action: "log-watch-time", elapsed: elapsed, url: window.location.href },
      (response) => {
        console.log("response from background", response);
        if (response.blockYt) {
          capExceeded = true;
          console.log("bro you exceeded your limit pls stop watching");
          showToast(" exceeded your allowed time ");
        }
      },
    );
  });
}
