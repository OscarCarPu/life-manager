const config = {
  NOTIFICATION_TIMEOUT: 3000,
  FADEOUT_DURATION: 400,
  MAX_NOTIFICATIONS: 5,
  DATA_ATTRIBUTES: {
    TASK_ID: "data-task-id",
  },
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

const safeSetTextContent = (id, text) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  } else {
    console.warn(`Element with ID "${id}" not found.`);
  }
};

const showTaskDetails = async (event, planningItem) => {
  event.preventDefault();
  const taskId = planningItem.getAttribute(config.DATA_ATTRIBUTES.TASK_ID);
  if (!taskId) return;

  try {
    const task = await makeApiRequest(
      `${API_BASE_URL}/tasks/tasks/${taskId}/general-info`,
      "GET",
    );

    // Populate basic info
    safeSetTextContent("taskTitle", task.title || "Untitled Task");
    safeSetTextContent("taskDueDate", formatDate(task.due_date));
    safeSetTextContent(
      "taskDescription",
      task.description || "No description available",
    );

    // Set status with appropriate styling
    const statusElement = document.getElementById("taskStatus");
    if (statusElement) {
      const status = task.state || "unknown";
      statusElement.textContent = formatStatus(status);
      statusElement.className = getStatusCssClass(status);
    } else {
      console.warn(`Element with ID "taskStatus" not found.`);
    }

    // Handle project info
    const projectSection = document.getElementById("projectSection");
    if (task.project) {
      safeSetTextContent("projectName", task.project.name);
      const projectStatusElement = document.getElementById("projectStatus");
      const projectStatus = task.project.state || "unknown";
      projectStatusElement.textContent = formatStatus(projectStatus);
      projectStatusElement.className = getStatusCssClass(projectStatus, true);
      projectSection.style.display = "block";
    } else if (projectSection) {
      projectSection.style.display = "none";
    }

    // Handle notes
    const notesContainer = document.getElementById("taskNotes");
    const notesSection = document.getElementById("notesSection");
    if (task.last_notes && task.last_notes.length > 0) {
      notesContainer.innerHTML = task.last_notes
        .map(
          (note) =>
            `<div class="note-item">${note.content || "Empty note"}</div>`,
        )
        .join("");
      notesSection.style.display = "block";
    } else if (notesSection) {
      notesSection.style.display = "none";
    }

    // Handle plannings with simplified priority display
    const planningsContainer = document.getElementById("taskPlannings");
    const planningsSection = document.getElementById("planningsSection");
    if (task.next_plannings && task.next_plannings.length > 0) {
      planningsContainer.innerHTML = task.next_plannings
        .map((planning) => {
          const formattedDate = formatDate(planning.planned_date);
          const timeInfo =
            planning.start_hour && planning.end_hour
              ? `${planning.start_hour.split(":").slice(0, 2).join(":")} - ${planning.end_hour.split(":").slice(0, 2).join(":")}`
              : planning.start_hour
                ? `${planning.start_hour.split(":").slice(0, 2).join(":")}`
                : "No time set";
          const priority = planning.priority || 0;
          const priorityClass = priority > 0 ? `priority-${priority}` : "";

          return `
          <div class="planning-item ${priorityClass}">
            <div class="planning-date">${formattedDate}</div>
            <div class="planning-time">${timeInfo}</div>
            ${
              priority > 0
                ? `
              <div class="priority-line mt-2">
                <div class="priority-fill priority-${priority}"></div>
              </div>
            `
                : ""
            }
          </div>
        `;
        })
        .join("");
      planningsSection.style.display = "block";
    } else if (planningsSection) {
      planningsSection.style.display = "none";
    }

    // Store current task id on the detail modal for editing
    const taskModalElement = document.getElementById("taskModal");
    if (taskModalElement) {
      taskModalElement.dataset.currentTaskId = taskId;
      taskModalElement.dataset.projectId = task.project
        ? task.project.id
        : task.project_id || "";
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("taskModal"));
    modal.show();
  } catch (error) {
    console.error("Error loading task details:", error);
    showNotification("Failed to load task details", "danger");
  }
};

// Utility to stack Bootstrap 5 modals safely
function openStackedModal(currentModalEl, newModalEl) {
  if (!newModalEl) return;
  // If Bootstrap already supports stacking via appended backdrop, just show
  // We manually increase z-index if another modal is open
  const openModals = document.querySelectorAll(".modal.show");
  const baseZ = 1050; // bootstrap default for modal
  newModalEl.style.zIndex = baseZ + openModals.length * 20;
  // Adjust existing backdrops
  const backdrops = document.querySelectorAll(".modal-backdrop");
  backdrops.forEach((bd, idx) => {
    bd.style.zIndex = 1040 + idx * 20;
  });
  const newModal = new bootstrap.Modal(newModalEl);
  newModal.show();
  // Focus first input if present
  const firstInput = newModalEl.querySelector("input, textarea, select");
  if (firstInput) setTimeout(() => firstInput.focus(), 300);
}

// Add listener to open edit modal from task detail modal
document.addEventListener("DOMContentLoaded", () => {
  const editFromDetailBtn = document.getElementById(
    "open-edit-task-from-detail",
  );
  if (!editFromDetailBtn) return;
  editFromDetailBtn.addEventListener("click", async () => {
    const taskModalElement = document.getElementById("taskModal");
    if (!taskModalElement) return;
    const taskId = taskModalElement.dataset.currentTaskId;
    if (!taskId) {
      showNotification("Task not loaded", "warning");
      return;
    }
    try {
      const data = await makeApiRequest(
        `${API_BASE_URL}/tasks/tasks/${taskId}`,
        "GET",
      );
      const taskEditModalEl = document.getElementById("taskEditModal");
      if (!taskEditModalEl) {
        showNotification("Edit modal not available", "danger");
        return;
      }
      // Fill form
      const idInput = document.getElementById("task-id");
      const projInput = document.getElementById("task-project-id");
      const titleInput = document.getElementById("task-title");
      const descInput = document.getElementById("task-description");
      const dueInput = document.getElementById("task-due-date");
      const stateSelect = document.getElementById("task-state");
      const label = document.getElementById("taskEditModalLabel");
      if (idInput) idInput.value = data.id || "";
      if (projInput)
        projInput.value =
          data.project_id || taskModalElement.dataset.projectId || "";
      if (titleInput) titleInput.value = data.title || "";
      if (descInput) descInput.value = data.description || "";
      if (dueInput) dueInput.value = data.due_date || "";
      if (stateSelect && data.state) stateSelect.value = data.state;
      if (label) label.textContent = "Edit Task";

      // Strategy: show edit modal stacked above detail
      openStackedModal(taskModalElement, taskEditModalEl);

      // Fallback: if stacking fails (user still sees only backdrop), close detail then reopen edit
      setTimeout(() => {
        const visibleEdit = taskEditModalEl.classList.contains("show");
        if (!visibleEdit) return; // already fine
        const detailVisible = taskModalElement.classList.contains("show");
        if (detailVisible) {
          // Check if edit modal is obscured
          const editRect = taskEditModalEl.getBoundingClientRect();
          if (editRect.width === 0 || editRect.height === 0) {
            const detailInstance =
              bootstrap.Modal.getInstance(taskModalElement);
            if (detailInstance) detailInstance.hide();
          }
        }
      }, 600);
    } catch (e) {
      // error already notified
    }
  });
});
