let timer;
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

function updateDurations() {
  pomodoroDuration = parseInt(pomodoroInput.value) * 60;
  breakDuration = parseInt(breakInput.value) * 60;
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
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        isBreak = !isBreak;
        timeLeft = isBreak ? breakDuration : pomodoroDuration;
        updateDisplay();
        if (isBreak) {
          alert("Pomodoro completed! Time for a break.");
        } else {
          alert("Break completed! Back to work.");
          pomodoroCount++;
          pomodoroCountSpan.textContent = pomodoroCount;
        }
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = pomodoroDuration;
  isBreak = false;
  isRunning = false;
  updateDisplay();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

pomodoroInput.addEventListener("change", updateDurations);
breakInput.addEventListener("change", updateDurations);

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
