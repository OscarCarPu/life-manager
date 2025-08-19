const config = {
  NOTIFICATION_TIMEOUT: 3000,
  FADEOUT_DURATION: 400,
  MAX_NOTIFICATIONS: 5,
};

let notificationCounter = 0;

async function showNotification(message, type = "info") {
  const container = document.getElementById("notifications-container");
  if (!container) {
    console.error("Notifications container not found");
    return;
  }

  // Remove excess notifications if we have too many
  const existingNotifications =
    container.querySelectorAll(".notification-item");
  if (existingNotifications.length >= config.MAX_NOTIFICATIONS) {
    const oldestNotification = existingNotifications[0];
    fadeOutNotification(oldestNotification);
  }

  // Generate unique ID
  const notificationId = `notification-${++notificationCounter}`;

  try {
    // Request rendered notification template from Flask
    const response = await fetch("/notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        type: type,
        id: notificationId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to render notification");
    }

    const notificationHtml = await response.text();

    // Create temporary container to parse HTML
    const temp = document.createElement("div");
    temp.innerHTML = notificationHtml.trim();
    const notificationElement = temp.firstElementChild;

    // Add to container
    container.appendChild(notificationElement);

    // Set up manual close button functionality
    const closeButton = notificationElement.querySelector(".btn-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        fadeOutNotification(notificationElement);
      });
    }

    // Auto-remove after timeout
    setTimeout(() => {
      if (document.getElementById(notificationId)) {
        fadeOutNotification(notificationElement);
      }
    }, config.NOTIFICATION_TIMEOUT);
  } catch (error) {
    console.error("Error showing notification:", error);
    // Fallback to simple notification
    showSimpleNotification(message, type, notificationId);
  }
}

// Fallback function for when Flask template rendering fails
function showSimpleNotification(message, type, id) {
  const container = document.getElementById("notifications-container");
  const notificationElement = document.createElement("div");
  notificationElement.id = id;
  notificationElement.className = `alert alert-${type} alert-dismissible notification-item`;
  notificationElement.setAttribute("role", "alert");

  notificationElement.innerHTML = `<span>${message}</span><button type="button" class="btn-close" aria-label="Close"></button>`;

  container.appendChild(notificationElement);

  const closeButton = notificationElement.querySelector(".btn-close");
  closeButton.addEventListener("click", () => {
    fadeOutNotification(notificationElement);
  });
}

function fadeOutNotification(element) {
  if (!element) return;

  element.classList.add("fade-out");

  setTimeout(() => {
    if (element.parentNode) {
      element.remove();
    }
  }, config.FADEOUT_DURATION);
}

const makeApiRequest = async (url, method, body = null) => {
  try {
    const options = {
      method: method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to ${method.toLowerCase()}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error with API request:", error);
    showNotification(`Error: ${error.message}`, "danger");
    throw error;
  }
};
