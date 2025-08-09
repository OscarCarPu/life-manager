// filepath: /home/ocp/dev/life-manager/backend/flask/static/js/calendar.js
let draggedElement = null;
let draggedPlanningId = null;
let originalDate = null;

function dragStart(event) {
  draggedElement = event.target;
  draggedPlanningId = event.target.getAttribute("data-planning-id");
  originalDate = event.target.getAttribute("data-current-date");

  event.target.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/html", event.target.outerHTML);
}

function allowDrop(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function dragEnter(event) {
  event.preventDefault();
  const dropZone = event.currentTarget;
  if (dropZone.classList.contains("drop-zone")) {
    dropZone.classList.add("drag-over");

    // Update no-plannings text if present
    const noPlannings = dropZone.querySelector(".no-plannings");
    if (noPlannings) {
      noPlannings.textContent = "Drop here to move planning";
      noPlannings.classList.add("drag-over-text");
    }
  }
}

function dragLeave(event) {
  const dropZone = event.currentTarget;
  const rect = dropZone.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;

  // Check if we're actually leaving the drop zone
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    dropZone.classList.remove("drag-over");

    // Reset no-plannings text if present
    const noPlannings = dropZone.querySelector(".no-plannings");
    if (noPlannings) {
      noPlannings.textContent = "No plannings for this day.";
      noPlannings.classList.remove("drag-over-text");
    }
  }
}

function drop(event) {
  event.preventDefault();
  const dropZone = event.currentTarget;
  const newDate = dropZone.getAttribute("data-date");

  // Remove visual feedback
  dropZone.classList.remove("drag-over");
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }

  // Reset no-plannings text if present
  const noPlannings = dropZone.querySelector(".no-plannings");
  if (noPlannings) {
    noPlannings.textContent = "No plannings for this day.";
    noPlannings.classList.remove("drag-over-text");
  }

  // Don't do anything if dropped on the same date
  if (newDate === originalDate) {
    return;
  }

  // Update the planning via API
  updateTaskPlanning(draggedPlanningId, newDate, originalDate);
}

async function updateTaskPlanning(planningId, newDate, oldDate) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tasks/task_planning/${planningId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planned_date: newDate,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update planning");
    }

    const updatedPlanning = await response.json();

    // Update the UI
    movePlanningInDOM(draggedElement, newDate, oldDate);

    showNotification("Planning moved successfully!", "success");
  } catch (error) {
    console.error("Error updating planning:", error);
    showNotification(`Error: ${error.message}`, "error");
  } finally {
    // Reset drag state
    draggedElement = null;
    draggedPlanningId = null;
    originalDate = null;
  }
}

function movePlanningInDOM(element, newDate, oldDate) {
  // Remove from old container
  const oldContainer = document.getElementById(`plannings-${oldDate}`);
  const newContainer = document.getElementById(`plannings-${newDate}`);

  if (!oldContainer || !newContainer) {
    console.error("Could not find containers for date movement");
    return;
  }

  // Update the element's data attribute
  element.setAttribute("data-current-date", newDate);
  element.classList.remove("dragging");

  // Remove "no plannings" message from new container if it exists
  const noPlannings = newContainer.querySelector(".no-plannings");
  if (noPlannings) {
    noPlannings.remove();
  }

  // Move the element
  newContainer.appendChild(element);

  // Add "no plannings" message to old container if it's now empty
  const remainingPlannings = oldContainer.querySelectorAll(
    ".planning-item:not(.no-plannings)",
  );
  if (remainingPlannings.length === 0) {
    const noPlanningsItem = document.createElement("li");
    noPlanningsItem.className =
      "list-group-item text-center text-muted no-plannings";
    noPlanningsItem.textContent = "No plannings for this day.";
    oldContainer.appendChild(noPlanningsItem);
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `alert alert-${type === "error" ? "danger" : "success"} alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 10000; min-width: 300px;";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Add drag end event listener to clean up if drag is cancelled
document.addEventListener("dragend", function (event) {
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }

  // Remove drag-over class from all drop zones
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.classList.remove("drag-over");
    const noPlannings = zone.querySelector(".no-plannings");
    if (noPlannings) {
      noPlannings.textContent = "No plannings for this day.";
      noPlannings.classList.remove("drag-over-text");
    }
  });
});
