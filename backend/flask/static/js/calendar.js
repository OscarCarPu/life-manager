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

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    dropZone.classList.remove("drag-over");

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

  dropZone.classList.remove("drag-over");
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }

  const noPlannings = dropZone.querySelector(".no-plannings");
  if (noPlannings) {
    noPlannings.textContent = "No plannings for this day.";
    noPlannings.classList.remove("drag-over-text");
  }

  if (newDate === originalDate) {
    return;
  }

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

    movePlanningInDOM(draggedElement, newDate, oldDate);

    showNotification("Planning moved successfully!", "success");
  } catch (error) {
    console.error("Error updating planning:", error);
    showNotification(`Error: ${error.message}`, "error");
  } finally {
    draggedElement = null;
    draggedPlanningId = null;
    originalDate = null;
  }
}

function movePlanningInDOM(element, newDate, oldDate) {
  const oldContainer = document.getElementById(`plannings-${oldDate}`);
  const newContainer = document.getElementById(`plannings-${newDate}`);

  if (!oldContainer || !newContainer) {
    console.error("Could not find containers for date movement");
    return;
  }

  element.setAttribute("data-current-date", newDate);
  element.classList.remove("dragging");

  const noPlannings = newContainer.querySelector(".no-plannings");
  if (noPlannings) {
    noPlannings.remove();
  }

  newContainer.appendChild(element);

  const plannings = Array.from(newContainer.querySelectorAll(".planning-item"));
  plannings.sort((a, b) => {
    const hourA = a.querySelector(".planning-hour").textContent.trim();
    const hourB = b.querySelector(".planning-hour").textContent.trim();

    const getStartHour = (timeText) => {
      if (!timeText) return 1480;
      const match = timeText.match(/^(\d{1,2})(:?\d{2})?/);
      if (!match) return 1480; // Default to a high value if no match
      const hour = parseInt(match[1]);
      const minute = match[2] ? parseInt(match[2].slice(1)) : 0;
      return hour * 60 + minute;
    };

    const startA = getStartHour(hourA);
    const startB = getStartHour(hourB);
    if (startA !== startB) {
      return startA - startB;
    }

    const priorityA =
      parseInt(a.querySelector(".priority-fill").style.width) || 0;
    const priorityB =
      parseInt(b.querySelector(".priority-fill").style.width) || 0;
    return priorityB - priorityA;
  });

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
  const notification = document.createElement("div");
  notification.className = `alert alert-${type === "error" ? "danger" : "success"} alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 10000; min-width: 300px;";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

document.addEventListener("dragend", function (event) {
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }

  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.classList.remove("drag-over");
    const noPlannings = zone.querySelector(".no-plannings");
    if (noPlannings) {
      noPlannings.textContent = "No plannings for this day.";
      noPlannings.classList.remove("drag-over-text");
    }
  });
});
