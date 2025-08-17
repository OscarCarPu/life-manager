const localConfig = {
  CLASSES: {
    DRAGGING: "dragging",
    DRAG_OVER: "drag-over",
    NO_PLANNINGS: "no-plannings",
    DRAG_OVER_TEXT: "drag-over-text",
    PLANNING_ITEM: "planning-item",
  },
  DATA_ATTRIBUTES: {
    PLANNING_ID: "data-planning-id",
    CURRENT_DATE: "data-current-date",
    ACTION: "data-action",
    PRIORITY: "data-priority",
    DATE: "data-date",
  },
};

const state = {
  draggedElement: null,
  draggedPlanningId: null,
  originalDate: null,
};

// Sort plannings in a container
const sortPlannings = (container) => {
  const plannings = Array.from(
    container.querySelectorAll(`.${localConfig.CLASSES.PLANNING_ITEM}`),
  );
  plannings.sort((a, b) => {
    const hourA = a.querySelector(".planning-hour").textContent.trim();
    const hourB = b.querySelector(".planning-hour").textContent.trim();

    const getStartHour = (timeText) => {
      if (!timeText) return 1500;
      const match = timeText.match(/^(\d{1,2}):?(\d{2})?/);
      if (!match) return 1500;
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
      parseInt(
        a
          .querySelector(".priority-fill")
          .getAttribute(localConfig.DATA_ATTRIBUTES.PRIORITY),
      ) || 0;
    const priorityB =
      parseInt(
        b
          .querySelector(".priority-fill")
          .getAttribute(localConfig.DATA_ATTRIBUTES.PRIORITY),
      ) || 0;
    return priorityB - priorityA;
  });
  plannings.forEach((planning) => container.appendChild(planning));
};

//handle DOM changes for "no planning"
function handleNoPlannings(container) {
  const remainingPlannings = container.querySelectorAll(
    `.${localConfig.CLASSES.PLANNING_ITEM}`,
  ).length;

  let noPlanningsItem = container.querySelector(
    `.${localConfig.CLASSES.NO_PLANNINGS}`,
  );

  if (remainingPlannings === 0) {
    if (!noPlanningsItem) {
      noPlanningsItem = document.createElement("li");
      noPlanningsItem.className = `list-group-item text-center text-muted ${localConfig.CLASSES.NO_PLANNINGS}`;
      noPlanningsItem.textContent = "No plannings for this day.";
      container.appendChild(noPlanningsItem);
    }
  } else {
    if (noPlanningsItem) {
      noPlanningsItem.remove();
    }
  }
}

// Handle API requests
async function makeApiRequest(url, method, body = null) {
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
    console.error(`Erro with API request:`, error);
    showNotification(`Error: ${error.message}`, "danger");
    throw error;
  }
}

// Event handlers
function dragStart(event) {
  state.draggedElement = event.target;
  state.draggedPlanningId = event.target.getAttribute(
    localConfig.DATA_ATTRIBUTES.PLANNING_ID,
  );
  state.originalDate = event.target.getAttribute(
    localConfig.DATA_ATTRIBUTES.CURRENT_DATE,
  );

  event.target.classList.add(localConfig.CLASSES.DRAGGING);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/html", event.target.outerHTML);
}

function allowDrop(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function handleDragOverState(event, add = true) {
  event.preventDefault();
  const target = event.currentTarget;
  const className = localConfig.CLASSES.DRAG_OVER;

  if (add) {
    target.classList.add(className);
    const noPlannings = target.querySelector(
      `.${localConfig.CLASSES.NO_PLANNINGS}`,
    );
    if (noPlannings) {
      noPlannings.textContent = "Drop here to move planning";
      noPlannings.classList.add(localConfig.CLASSES.DRAG_OVER_TEXT);
    }
  } else {
    // Avoid flicker
    const rect = target.getBoundingClientRect();
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!isInside) {
      target.classList.remove(className);
      const noPlannings = target.querySelector(
        `.${localConfig.CLASSES.NO_PLANNINGS}`,
      );
      if (noPlannings) {
        noPlannings.textContent = "No plannings for this day.";
        noPlannings.classList.remove(localConfig.CLASSES.DRAG_OVER_TEXT);
      }
    }
  }
}

async function drop(event) {
  event.preventDefault();
  const dropZone = event.currentTarget;
  const newDate = dropZone.getAttribute(localConfig.DATA_ATTRIBUTES.DATE);

  // Clean drag-over
  dropZone.classList.remove(localConfig.CLASSES.DRAG_OVER);
  const noPlannings = dropZone.querySelector(
    `.${localConfig.CLASSES.NO_PLANNINGS}`,
  );
  if (noPlannings) {
    noPlannings.textContent = "No plannings for this day.";
    noPlannings.classList.remove(localConfig.CLASSES.DRAG_OVER_TEXT);
  }

  if (newDate === state.originalDate) {
    return; // No change in date, do nothing
  }

  try {
    await makeApiRequest(
      `${API_BASE_URL}/tasks/task_planning/${state.draggedPlanningId}`,
      "PATCH",
      { planned_date: newDate },
    );
    movePlanningInDOM(state.draggedElement, newDate, state.originalDate);
    showNotification("Planning moved successfully", "success");
  } catch (error) {
    console.error("Error in new date planning:", error);
    showNotification(`Error: ${error.message}`, "danger");
  } finally {
    state.draggedElement = null;
    state.draggedPlanningId = null;
    state.originalDate = null;
  }
}

async function dropAction(event) {
  event.preventDefault();
  const actionZone = event.currentTarget;
  const action = actionZone.getAttribute(localConfig.DATA_ATTRIBUTES.ACTION);
  actionZone.classList.remove(localConfig.CLASSES.DRAG_OVER);

  if (!state.draggedElement) return;

  try {
    if (action === "delete") {
      await makeApiRequest(
        `${API_BASE_URL}/tasks/task_planning/${state.draggedPlanningId}`,
        "DELETE",
      );
      const container = state.draggedElement.parentElement;
      state.draggedElement.remove();
      handleNoPlannings(container);
      showNotification("Planning deleted successfully", "success");
    } else if (action === "priority") {
      const priority = parseInt(
        actionZone.getAttribute(localConfig.DATA_ATTRIBUTES.PRIORITY),
      );
      await makeApiRequest(
        `${API_BASE_URL}/tasks/task_planning/${state.draggedPlanningId}`,
        "PATCH",
        { priority: priority },
      );
      const priorityFill = state.draggedElement.querySelector(".priority-fill");
      if (priorityFill) {
        priorityFill.className = `priority-fill priority-${priority}`;
        priorityFill.setAttribute("data-priority", priority);
      }
      showNotification("Planning priority updated successfully", "success");
    }
  } catch (error) {
    console.error("ERror in dropAction:", error);
    showNotification(`Error: ${error.message}`, "danger");
  } finally {
    state.draggedElement = null;
    state.draggedPlanningId = null;
    state.originalDate = null;
  }
}

// Move planning in DOM
function movePlanningInDOM(element, newDate, oldDate) {
  const oldContainer = document.getElementById(`plannings-${oldDate}`);
  const newContainer = document.getElementById(`plannings-${newDate}`);

  if (!oldContainer || !newContainer) {
    console.error("Invalid containers for planning move");
    return;
  }

  element.setAttribute(localConfig.DATA_ATTRIBUTES.CURRENT_DATE, newDate);
  element.classList.remove(localConfig.CLASSES.DRAGGING);

  newContainer.appendChild(element);
  handleNoPlannings(newContainer);
  handleNoPlannings(oldContainer);

  sortPlannings(newContainer);
}

// Cleanup
document.addEventListener("dragend", () => {
  if (state.draggedElement) {
    state.draggedElement.classList.remove(localConfig.CLASSES.DRAGGING);
  }
  document.querySelectorAll(".drop-zone, .action-zone").forEach((zone) => {
    zone.classList.remove(localConfig.CLASSES.DRAG_OVER);
    const noPlannings = zone.querySelector(
      `.${localConfig.CLASSES.NO_PLANNINGS}`,
    );
    if (noPlannings) {
      noPlannings.textContent = "No plannings for this day.";
      noPlannings.classList.remove(localConfig.CLASSES.DRAG_OVER_TEXT);
    }
  });
});

// Hide any open context menu
function hideContextMenu() {
  const menu = document.getElementById("time-context-menu");
  if (menu) {
    menu.style.display = "none";
    // Clean up event listeners to prevent memory leaks
    const saveButton = menu.querySelector("#save-time");
    const cancelButton = menu.querySelector("#cancel-time");
    saveButton.replaceWith(saveButton.cloneNode(true));
    cancelButton.replaceWith(cancelButton.cloneNode(true));
  }
}

// Show and manage the time selection context menu
function showTimeContextMenu(event, planningItem) {
  event.preventDefault();
  hideContextMenu(); // Hide any other open menu before showing a new one

  const planningId = planningItem.getAttribute(
    localConfig.DATA_ATTRIBUTES.PLANNING_ID,
  );
  const menu = document.getElementById("time-context-menu");

  // Position the menu near the cursor
  menu.style.left = `${event.clientX + 5}px`;
  menu.style.top = `${event.clientY + 5}px`;
  menu.style.display = "block";

  const startTimeInput = menu.querySelector("#start-time");
  const endTimeInput = menu.querySelector("#end-time");
  const saveButton = menu.querySelector("#save-time");
  const cancelButton = menu.querySelector("#cancel-time");

  // Function to handle the save action
  const saveHandler = async () => {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (startTime || endTime) {
      try {
        await makeApiRequest(
          `${API_BASE_URL}/tasks/task_planning/${planningId}`,
          "PATCH",
          {
            start_hour: startTime || null,
            end_hour: endTime || null,
          },
        );

        const hourSpan = planningItem.querySelector(".planning-hour");
        if (hourSpan) {
          if (startTime && endTime) {
            hourSpan.textContent = `${startTime} - ${endTime}`;
          } else if (startTime) {
            hourSpan.textContent = startTime;
          } else {
            hourSpan.textContent = ""; // Clear if no time is set
          }
        }
        const container = planningItem.closest(".list-group");
        if (container) {
          sortPlannings(container);
        }
        showNotification("Time updated successfully", "success");
      } catch (error) {
        console.error("Error updating time:", error);
        showNotification(`Error: ${error.message}`, "danger");
      }
    }
    hideContextMenu();
  };

  // Add event listeners to the new menu's buttons
  saveButton.addEventListener("click", saveHandler);
  cancelButton.addEventListener("click", hideContextMenu);
}

// Close context menu when clicking outside of it
document.addEventListener("click", (e) => {
  const menu = document.getElementById("time-context-menu");
  // If the menu is visible and the click is outside the menu and not on a planning item
  if (
    menu &&
    menu.style.display === "block" &&
    !menu.contains(e.target) &&
    !e.target.closest(".planning-item")
  ) {
    hideContextMenu();
  }
});

// Assign event listeners
document.querySelectorAll(".drop-zone").forEach((zone) => {
  zone.addEventListener("dragover", allowDrop);
  zone.addEventListener("dragenter", (e) => handleDragOverState(e, true));
  zone.addEventListener("dragleave", (e) => handleDragOverState(e, false));
  zone.addEventListener("drop", drop);
});

document.querySelectorAll(".action-zone").forEach((zone) => {
  zone.addEventListener("dragover", allowDrop);
  zone.addEventListener("dragenter", (e) => handleDragOverState(e, true));
  zone.addEventListener("dragleave", (e) => handleDragOverState(e, false));
  zone.addEventListener("drop", dropAction);
});

document.querySelectorAll(".planning-item").forEach((item) => {
  item.addEventListener("dragstart", dragStart);
  item.addEventListener("contextmenu", (e) => {
    showTimeContextMenu(e, item);
  });
});
