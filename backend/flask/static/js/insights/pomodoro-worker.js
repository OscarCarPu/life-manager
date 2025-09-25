let timer;
let pomodoroDuration = 25 * 60;
let breakDuration = 5 * 60;
let timeLeft;
let isBreak = false;
let isRunning = false;

onmessage = function (e) {
  const data = e.data;
  if (data.type === "start") {
    if (!isRunning) {
      isRunning = true;
      timer = setInterval(() => {
        timeLeft--;
        postMessage({ type: "tick", timeLeft: timeLeft });
        if (timeLeft <= 0) {
          clearInterval(timer);
          isBreak = !isBreak;
          timeLeft = isBreak ? breakDuration : pomodoroDuration;
          isRunning = false;
          postMessage({ type: "done", isBreak: isBreak });
        }
      }, 1000);
    }
  } else if (data.type === "pause") {
    clearInterval(timer);
    isRunning = false;
  } else if (data.type === "reset") {
    clearInterval(timer);
    timeLeft = pomodoroDuration;
    isBreak = false;
    isRunning = false;
  } else if (data.type === "updateDurations") {
    pomodoroDuration = data.pomodoroDuration;
    breakDuration = data.breakDuration;
    if (!isRunning) {
      timeLeft = isBreak ? breakDuration : pomodoroDuration;
    }
  } else if (data.type === "init") {
    pomodoroDuration = data.pomodoroDuration;
    breakDuration = data.breakDuration;
    timeLeft = pomodoroDuration;
    isBreak = false;
  }
};
