function formatDate(dateString) {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${day}/${month}/${year}, ${weekday}`;
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

function getStatusCssClass(status) {
  if (!status) return "badge state-badge";
  const normalizedStatus = status.toLowerCase();
  return `badge state-badge ${normalizedStatus}`;
}

async function showNotification(message, type = "info") {
  const container = document.getElementById("notifications-container");
  if (!container) {
    console.error("Notifications container not found");
    return;
  }

  const existing = container.querySelectorAll(".notification-item");
  if (existing.length >= APP_CONFIG.MAX_NOTIFICATIONS) {
    const oldest = existing[0];
    fadeOutNotification(oldest);
  }

  const id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const response = await fetch("/notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, type, id }),
    });
    if (!response.ok) throw new Error("Failed to render notification");

    const html = await response.text();
    const temp = document.createElement("div");
    temp.innerHTML = html.trim();
    const el = temp.firstElementChild;
    container.appendChild(el);

    const closeButton = el.querySelector(".btn-close");
    if (closeButton)
      closeButton.addEventListener("click", () => fadeOutNotification(el));

    setTimeout(() => {
      if (document.getElementById(id)) fadeOutNotification(el);
    }, APP_CONFIG.NOTIFICATION_TIMEOUT);
  } catch (error) {
    console.error("Error showing notification:", error);
    showSimpleNotification(message, type, id);
  }
}

function showSimpleNotification(message, type, id) {
  const container = document.getElementById("notifications-container");
  if (!container) return;
  const el = document.createElement("div");
  el.id = id;
  el.className = `alert alert-${type} alert-dismissible notification-item`;
  el.setAttribute("role", "alert");
  el.innerHTML = `<span>${message}</span><button type="button" class="btn-close" aria-label="Close"></button>`;
  container.appendChild(el);
  const closeButton = el.querySelector(".btn-close");
  if (closeButton)
    closeButton.addEventListener("click", () => fadeOutNotification(el));
}

function fadeOutNotification(element) {
  if (!element) return;
  element.classList.add("fade-out");
  setTimeout(() => {
    if (element.parentNode) element.remove();
  }, APP_CONFIG.FADEOUT_DURATION);
}

async function makeApiRequest(url, method, body = null) {
  try {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorMsg = `Failed to ${method.toLowerCase()}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) errorMsg = errorData.detail;
      } catch {}
      throw new Error(errorMsg);
    }
    return response.json();
  } catch (error) {
    console.error("Error with API request:", error);
    showNotification(`Error: ${error.message}`, "danger");
    throw error;
  }
}

function safeSetTextContent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

window.formatDate = formatDate;
window.formatStatus = formatStatus;
window.getStatusCssClass = getStatusCssClass;
window.showNotification = showNotification;
window.showSimpleNotification = showSimpleNotification;
window.fadeOutNotification = fadeOutNotification;
window.makeApiRequest = makeApiRequest;
window.safeSetTextContent = safeSetTextContent;
