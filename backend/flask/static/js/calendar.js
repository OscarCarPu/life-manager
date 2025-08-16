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

// Nuevas funciones para las zonas de acción
function dragEnterAction(event) {
  event.preventDefault();
  const actionZone = event.currentTarget;
  actionZone.classList.add("drag-over");
}

function dragLeaveAction(event) {
  const actionZone = event.currentTarget;
  const rect = actionZone.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    actionZone.classList.remove("drag-over");
  }
}

// Nueva función para manejar drops en zonas de acción
function dropAction(event) {
  event.preventDefault();
  const actionZone = event.currentTarget;
  const action = actionZone.getAttribute("data-action");

  actionZone.classList.remove("drag-over");

  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }

  if (action === "delete") {
    deleteTaskPlanning(draggedPlanningId);
  } else if (action === "priority") {
    const priority = parseInt(actionZone.getAttribute("data-priority"));
    updateTaskPlanningPriority(draggedPlanningId, priority);
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

// Función para eliminar planning
async function deleteTaskPlanning(planningId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tasks/task_planning/${planningId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete planning");
    }

    // Remover elemento del DOM
    if (draggedElement) {
      const container = draggedElement.parentElement;
      draggedElement.remove();

      // Verificar si necesitamos mostrar "no plannings"
      const remainingPlannings = container.querySelectorAll(".planning-item");
      if (remainingPlannings.length === 0) {
        const noPlanningsItem = document.createElement("li");
        noPlanningsItem.className =
          "list-group-item text-center text-muted no-plannings";
        noPlanningsItem.textContent = "No plannings for this day.";
        container.appendChild(noPlanningsItem);
      }
    }

    showNotification("Planning deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting planning:", error);
    showNotification(`Error: ${error.message}`, "error");
  } finally {
    draggedElement = null;
    draggedPlanningId = null;
    originalDate = null;
  }
}

// Función para actualizar prioridad
async function updateTaskPlanningPriority(planningId, priority) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tasks/task_planning/${planningId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priority: priority,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update priority");
    }

    // Actualizar la visualización de prioridad en el DOM
    if (draggedElement) {
      const priorityFill = draggedElement.querySelector(".priority-fill");
      if (priorityFill) {
        const priorityColors = [
          "#FFD700",
          "#FFC107",
          "#FFA07A",
          "#FF4500",
          "#DC3545",
        ];
        priorityFill.style.width = `${(priority / 5) * 100}%`;
        priorityFill.style.backgroundColor = priorityColors[priority - 1];
      }
    }

    showNotification(`Priority updated to ${priority}!`, "success");
  } catch (error) {
    console.error("Error updating priority:", error);
    showNotification(`Error: ${error.message}`, "error");
  } finally {
    draggedElement = null;
    draggedPlanningId = null;
    originalDate = null;
  }
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
      if (timeText === "All day") return 24;
      const match = timeText.match(/^(\d{1,2}):?(\d{2})?/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]) || 0;
        return hours + minutes / 60;
      }
      return 25;
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

  plannings.forEach((planning) => newContainer.appendChild(planning));

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
  // Crear el elemento de notificación
  const notification = document.createElement("div");
  notification.className = `alert alert-${type === "success" ? "success" : type === "error" ? "danger" : "info"} alert-dismissible fade show position-fixed`;
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.zIndex = "1050";
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(notification);

  // Auto-remover después de 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

document.addEventListener("dragend", function (event) {
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
  }

  // Limpiar todas las zonas de drop
  document.querySelectorAll(".drop-zone, .action-zone").forEach((zone) => {
    zone.classList.remove("drag-over");
    const noPlannings = zone.querySelector(".no-plannings");
    if (noPlannings) {
      noPlannings.textContent = "No plannings for this day.";
      noPlannings.classList.remove("drag-over-text");
    }
  });
});
