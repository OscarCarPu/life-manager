const config = {
  NOTIFICATION_TIMEOUT: 3000,
  FADEOUT_DURATION: 400,
};

function showNotification(message, type = "info") {
  const alert = document.getElementById("alert");
  const alertMessage = document.getElementById("alert-message");

  // Clear any existing fade-out classes
  alert.classList.remove("hidden", "fade-out");
  alert.classList.add(`alert-${type}`, "show");
  alertMessage.textContent = message;

  setTimeout(() => {
    // Start fade-out animation
    alert.classList.add("fade-out");
    alert.classList.remove("show");

    // Hide completely after fade-out completes
    setTimeout(() => {
      alert.classList.add("hidden");
      alert.classList.remove(`alert-${type}`, "fade-out");
      alertMessage.textContent = "";
    }, config.FADEOUT_DURATION);
  }, config.NOTIFICATION_TIMEOUT);
}
