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
    TASK_ID: "data-task-id",
  },
  HIGH_LIMIT_MINUTES: 1500, // Represents a default value for sorting
};

const state = {
  draggedElement: null,
  draggedPlanningId: null,
  originalDate: null,
};

const parseTextToTime = (text, isEndTime = false) => {
  if (!text) return localConfig.HIGH_LIMIT_MINUTES;
  let match;
  if (isEndTime) {
    match = text.match(/- (\d{1,2}):?(\d{2})?$/);
  } else {
    match = text.match(/^(\d{1,2}):?(\d{2})?/);
  }

  if (!match) return localConfig.HIGH_LIMIT_MINUTES;

  const hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  return hour * 60 + minute;
};

const sortPlannings = (container) => {
  const plannings = Array.from(
    container.querySelectorAll(`.${localConfig.CLASSES.PLANNING_ITEM}`),
  );
  plannings.sort((a, b) => {
    const hourA = a.querySelector(".planning-hour").textContent.trim();
    const hourB = b.querySelector(".planning-hour").textContent.trim();
    const startA = parseTextToTime(hourA);
    const startB = parseTextToTime(hourB);

    if (startA !== startB) {
      return startA - startB;
    }

    const endA = parseTextToTime(hourA, true);
    const endB = parseTextToTime(hourB, true);
    if (endA !== endB) {
      return endA - endB;
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

const updateNoPlanningsState = (container) => {
  const { CLASSES } = localConfig;
  const remainingPlannings = container.querySelectorAll(
    `.${CLASSES.PLANNING_ITEM}`,
  ).length;
  let noPlanningsItem = container.querySelector(`.${CLASSES.NO_PLANNINGS}`);

  if (remainingPlannings === 0) {
    if (!noPlanningsItem) {
      noPlanningsItem = document.createElement("li");
      noPlanningsItem.className = `list-group-item text-center text-muted ${CLASSES.NO_PLANNINGS}`;
      noPlanningsItem.textContent = "No plannings for this day.";
      container.appendChild(noPlanningsItem);
    }
  } else if (noPlanningsItem) {
    noPlanningsItem.remove();
  }
};

// --- Event Handlers ---

const handleDragStart = (event) => {
  const item = event.currentTarget; // more robust than event.target
  const { PLANNING_ID, CURRENT_DATE } = localConfig.DATA_ATTRIBUTES;
  const { DRAGGING } = localConfig.CLASSES;
  state.draggedElement = item;
  state.draggedPlanningId = item.getAttribute(PLANNING_ID);
  state.originalDate = item.getAttribute(CURRENT_DATE);

  item.classList.add(DRAGGING);
  // Provide minimal data for Firefox compatibility
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", state.draggedPlanningId || "");
};

const handleAllowDrop = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

const handleDragOverState = (event, isOver) => {
  event.preventDefault();
  const target = event.currentTarget;
  const { DRAG_OVER, NO_PLANNINGS, DRAG_OVER_TEXT } = localConfig.CLASSES;

  if (isOver) {
    target.classList.add(DRAG_OVER);
    const noPlannings = target.querySelector(`.${NO_PLANNINGS}`);
    if (noPlannings) {
      noPlannings.textContent = "Drop here to move planning";
      noPlannings.classList.add(DRAG_OVER_TEXT);
    }
  } else {
    // Avoid flicker on mouseout
    const rect = target.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      target.classList.remove(DRAG_OVER);
      const noPlannings = target.querySelector(`.${NO_PLANNINGS}`);
      if (noPlannings) {
        noPlannings.textContent = "No plannings for this day.";
        noPlannings.classList.remove(DRAG_OVER_TEXT);
      }
    }
  }
};

const handleDrop = async (event) => {
  event.preventDefault();
  const dropZone = event.currentTarget;
  const newDate = dropZone.getAttribute(localConfig.DATA_ATTRIBUTES.DATE);

  // Clean up drag-over state
  dropZone.classList.remove(localConfig.CLASSES.DRAG_OVER);
  const noPlannings = dropZone.querySelector(
    `.${localConfig.CLASSES.NO_PLANNINGS}`,
  );
  if (noPlannings) {
    noPlannings.textContent = "No plannings for this day.";
    noPlannings.classList.remove(localConfig.CLASSES.DRAG_OVER_TEXT);
  }
  if (newDate === state.originalDate) return;

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
  } finally {
    state.draggedElement = null;
    state.draggedPlanningId = null;
    state.originalDate = null;
  }
};

const handleDropAction = async (event) => {
  event.preventDefault();
  const actionZone = event.currentTarget;
  const { ACTION, PRIORITY } = localConfig.DATA_ATTRIBUTES;
  const action = actionZone.getAttribute(ACTION);
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
      updateNoPlanningsState(container);
      showNotification("Planning deleted successfully", "success");
    } else if (action === "priority") {
      const priority = parseInt(actionZone.getAttribute(PRIORITY));
      await makeApiRequest(
        `${API_BASE_URL}/tasks/task_planning/${state.draggedPlanningId}`,
        "PATCH",
        { priority: priority },
      );
      const priorityFill = state.draggedElement.querySelector(".priority-fill");
      if (priorityFill) {
        priorityFill.className = `priority-fill priority-${priority}`;
        priorityFill.setAttribute(PRIORITY, priority);
      }
      showNotification("Planning priority updated successfully", "success");
    }
  } catch (error) {
    console.error("Error in dropAction:", error);
  } finally {
    state.draggedElement = null;
    state.draggedPlanningId = null;
    state.originalDate = null;
  }
};

const movePlanningInDOM = (element, newDate, oldDate) => {
  const oldContainer = document.getElementById(`plannings-${oldDate}`);
  const newContainer = document.getElementById(`plannings-${newDate}`);
  if (!oldContainer || !newContainer) {
    console.error("Invalid containers for planning move");
    return;
  }
  element.setAttribute(localConfig.DATA_ATTRIBUTES.CURRENT_DATE, newDate);
  element.classList.remove(localConfig.CLASSES.DRAGGING);
  newContainer.appendChild(element);
  updateNoPlanningsState(newContainer);
  updateNoPlanningsState(oldContainer);
  sortPlannings(newContainer);
};

// --- Context Menu ---

const hideContextMenu = () => {
  const menu = document.getElementById("time-context-menu");
  if (menu) {
    menu.style.display = "none";
    // To prevent memory leaks, we clone and replace the buttons
    const saveButton = menu.querySelector("#save-time");
    const cancelButton = menu.querySelector("#cancel-time");
    saveButton.replaceWith(saveButton.cloneNode(true));
    cancelButton.replaceWith(cancelButton.cloneNode(true));
  }
};

const showTimeContextMenu = (event, planningItem) => {
  event.preventDefault();
  hideContextMenu();
  const planningId = planningItem.getAttribute(
    localConfig.DATA_ATTRIBUTES.PLANNING_ID,
  );
  const menu = document.getElementById("time-context-menu");
  if (!menu) return;

  menu.style.left = `${event.clientX + 5}px`;
  menu.style.top = `${event.clientY + 5}px`;
  menu.style.display = "block";

  const startTimeInput = menu.querySelector("#start-time");
  const endTimeInput = menu.querySelector("#end-time");
  const saveButton = menu.querySelector("#save-time");
  const cancelButton = menu.querySelector("#cancel-time");

  const saveHandler = async () => {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    if (!startTime && !endTime) return;
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
        hourSpan.textContent =
          startTime && endTime ? `${startTime} - ${endTime}` : startTime || "";
      }
      const container = planningItem.closest(".list-group");
      if (container) {
        sortPlannings(container);
      }
      showNotification("Time updated successfully", "success");
    } catch (error) {
      console.error("Error updating time:", error);
    } finally {
      hideContextMenu();
    }
  };

  saveButton.addEventListener("click", saveHandler);
  cancelButton.addEventListener("click", hideContextMenu);
};

// --- Global Handlers ---

const handleDragEnd = () => {
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
};

const handleGlobalClick = (e) => {
  const menu = document.getElementById("time-context-menu");
  if (
    menu &&
    menu.style.display === "block" &&
    !menu.contains(e.target) &&
    !e.target.closest(".planning-item")
  ) {
    hideContextMenu();
  }
};

const setupEventListeners = () => {
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", handleAllowDrop);
    zone.addEventListener("dragenter", (e) => handleDragOverState(e, true));
    zone.addEventListener("dragleave", (e) => handleDragOverState(e, false));
    zone.addEventListener("drop", handleDrop);
  });

  document.querySelectorAll(".action-zone").forEach((zone) => {
    zone.addEventListener("dragover", handleAllowDrop);
    zone.addEventListener("dragenter", (e) => handleDragOverState(e, true));
    zone.addEventListener("dragleave", (e) => handleDragOverState(e, false));
    zone.addEventListener("drop", handleDropAction);
  });

  document
    .querySelectorAll(`.${localConfig.CLASSES.PLANNING_ITEM}`)
    .forEach((item) => {
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("contextmenu", (e) => showTimeContextMenu(e, item));
      item.addEventListener("click", (e) => showTaskDetails(e, item));
    });

  document.addEventListener("dragend", handleDragEnd);
  document.addEventListener("click", handleGlobalClick);
};

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
});
