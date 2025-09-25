let pomodoroDuration = 25 * 60;
let breakDuration = 5 * 60;
let timeLeft = pomodoroDuration;
let isRunning = false;
let isBreak = false;
let pomodoroCount = 0;

const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const pomodoroCountSpan = document.getElementById("pomodoro-count");
const pomodoroInput = document.getElementById("pomodoro-duration");
const breakInput = document.getElementById("break-duration");

const worker = new Worker("pomodoro-worker.js");
worker.postMessage({
  type: "init",
  pomodoroDuration: pomodoroDuration,
  breakDuration: breakDuration,
});

worker.onmessage = function (e) {
  if (e.data.type === "tick") {
    timeLeft = e.data.timeLeft;
    updateDisplay();
  } else if (e.data.type === "done") {
    isBreak = e.data.isBreak;
    timeLeft = isBreak ? breakDuration : pomodoroDuration;
    updateDisplay();
    if (isBreak) {
      showNotification("Pomodoro completed! Time for a break.");
    } else {
      showNotification("Break completed! Back to work.");
      pomodoroCount++;
      pomodoroCountSpan.textContent = pomodoroCount;
    }
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }
};

function showNotification(message) {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Pomodoro Timer", { body: message });
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Pomodoro Timer", { body: message });
        } else {
          alert(message);
        }
      });
    } else {
      alert(message);
    }
  } else {
    alert(message);
  }
}

function updateDurations() {
  pomodoroDuration = parseInt(pomodoroInput.value) * 60;
  breakDuration = parseInt(breakInput.value) * 60;
  worker.postMessage({
    type: "updateDurations",
    pomodoroDuration: pomodoroDuration,
    breakDuration: breakDuration,
  });
  if (!isRunning) {
    timeLeft = isBreak ? breakDuration : pomodoroDuration;
    updateDisplay();
  }
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  document.getElementById("phase").textContent = isBreak ? "Break" : "Work";
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    worker.postMessage({ type: "start" });
  }
}

function pauseTimer() {
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  worker.postMessage({ type: "pause" });
}

function resetTimer() {
  timeLeft = pomodoroDuration;
  isBreak = false;
  isRunning = false;
  updateDisplay();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  worker.postMessage({ type: "reset" });
}

pomodoroInput.addEventListener("change", updateDurations);
breakInput.addEventListener("change", updateDurations);

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
