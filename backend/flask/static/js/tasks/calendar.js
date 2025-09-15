const dndState = {
  draggedElement: null,
  draggedPlanningId: null,
  originalDate: null,
};

// Parse "HH:MM" into minutes. Returns MAX_MINUTES when invalid/empty to sort to the end
function timeTextToMinutes(text) {
  if (!text) return APP_CONFIG.MAX_MINUTES;
  const match = text.match(/^(\d{1,2}):?(\d{2})?$/);
  if (!match) return APP_CONFIG.MAX_MINUTES;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes;
}

// Extract start/end minutes from "HH:MM - HH:MM" or "HH:MM" text
function parsePlanningTimeRange(text) {
  if (!text)
    return { start: APP_CONFIG.MAX_MINUTES, end: APP_CONFIG.MAX_MINUTES };
  const trimmed = text.trim();
  if (!trimmed)
    return { start: APP_CONFIG.MAX_MINUTES, end: APP_CONFIG.MAX_MINUTES };

  const parts = trimmed.split("-");
  const startText = parts[0]?.trim() || "";
  const endText = parts[1]?.trim() || "";

  return {
    start: timeTextToMinutes(startText),
    end: endText ? timeTextToMinutes(endText) : APP_CONFIG.MAX_MINUTES,
  };
}

// Helper: read numeric priority from classes like `priority-3`
function extractPriorityFromClasses(el) {
  if (!el) return null;
  for (const cls of el.classList) {
    const m = cls.match(/^priority-(\d)$/);
    if (m) return m[1];
  }
  return null;
}

// Canonicalize planning item classes to match initial markup
function applyPlanningVisualState(itemEl) {
  if (!itemEl) return;

  // 1) DONE state: task-state and planning-done are separate
  const taskState = itemEl.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE);
  const isPlanningDone =
    itemEl.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.DONE) === "true";

  // If planning is done, apply the 'task-done' class.
  itemEl.classList.toggle("planning-done", isPlanningDone);

  // Remove any existing planning icon
  const existingIcon = itemEl.querySelector(".planning-icon");
  if (existingIcon) existingIcon.remove();

  // Determine icon based on task state
  let iconClass = "";
  if (taskState === "completed") {
    iconClass = "fas fa-check-circle";
  } else if (taskState === "in_progress") {
    iconClass = "fas fa-spinner";
  }

  if (iconClass) {
    const icon = document.createElement("i");
    icon.className = `${iconClass} planning-icon`;
    const titleEl = itemEl.querySelector(".planning-task");
    if (titleEl) {
      titleEl.insertAdjacentElement("afterend", icon);
    }
  }

  // 2) Task Priority Circle - handle task priority icon next to title
  const titleEl = itemEl.querySelector(".planning-task");
  if (titleEl) {
    // Get task priority from data attribute (most reliable source)
    let taskPriority = null;
    const taskPriorityAttr = itemEl.getAttribute("data-task-priority");
    if (taskPriorityAttr) {
      taskPriority = parseInt(taskPriorityAttr, 10);
    } else {
      // Fallback: try to extract from existing circle before removing it
      const existingCircle = titleEl.querySelector(".priority-circle");
      if (existingCircle) {
        const priorityText = existingCircle.textContent?.trim();
        if (priorityText && !isNaN(parseInt(priorityText, 10))) {
          taskPriority = parseInt(priorityText, 10);
          // Store it for future use
          itemEl.setAttribute("data-task-priority", taskPriority);
        }
      }
    }

    // Check if we need to update the priority circle
    const existingCircle = titleEl.querySelector(".priority-circle");
    const needsUpdate =
      !existingCircle ||
      (taskPriority &&
        !existingCircle.classList.contains(`priority-${taskPriority}`)) ||
      (taskPriority &&
        existingCircle.textContent.trim() !== String(taskPriority)) ||
      (!taskPriority && existingCircle);

    // Only update if circle is missing, incorrect, or priority changed
    if (needsUpdate) {
      // Remove existing circle if any
      if (existingCircle) existingCircle.remove();

      // If we have a valid task priority, create the circle
      if (taskPriority && taskPriority >= 1 && taskPriority <= 5) {
        const circle = document.createElement("span");
        circle.className = `priority-circle priority-${taskPriority}`;
        circle.setAttribute("title", `Priority ${taskPriority}`);
        circle.textContent = taskPriority;
        titleEl.appendChild(circle);
      }
    }
  }

  // 3) Planning Priority on the inner .priority-fill as: "priority-fill priority-<n>"
  let fill = itemEl.querySelector(".priority-fill");
  if (!fill) {
    // Create structure if missing to mirror initial template
    const line =
      itemEl.querySelector(".priority-line") ||
      (() => {
        const l = document.createElement("div");
        l.className = "priority-line mt-2";
        itemEl.appendChild(l);
        return l;
      })();
    fill = document.createElement("div");
    line.appendChild(fill);
  }
  // Compute priority from attribute or existing class; fallback to 0
  let pr =
    fill.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.PRIORITY) ||
    extractPriorityFromClasses(fill) ||
    "0";
  const prNum = parseInt(pr, 10);
  pr = Number.isNaN(prNum) ? "0" : String(prNum);

  // Strict canonical classes to match initial template
  fill.className = `priority-fill priority-${pr}`;
}

// Sort planning items in a list-group: start time ASC, then end time ASC, then priority DESC
function orderAndApplyClasses(listEl) {
  if (!listEl) return;

  const items = Array.from(
    listEl.querySelectorAll(`.${APP_CONFIG.CLASSES.PLANNING_ITEM}`),
  );

  // Apply classes, normalize priority, and attach listeners
  items.forEach((el) => {
    // Extract and store task priority if not already stored
    if (!el.hasAttribute("data-task-priority")) {
      const priorityCircle = el.querySelector(".priority-circle");
      if (priorityCircle) {
        const priorityText = priorityCircle.textContent?.trim();
        if (priorityText && !isNaN(parseInt(priorityText, 10))) {
          el.setAttribute("data-task-priority", priorityText);
        }
      }
    }

    applyPlanningVisualState(el);

    // Ensure draggable attribute exists for accessibility
    if (!el.hasAttribute("draggable")) el.setAttribute("draggable", "true");

    // Attach essential event listeners if not already attached
    if (!el.dataset.listenersAttached) {
      el.addEventListener("dragstart", onDragStart);
      el.addEventListener("contextmenu", (e) => showTimeContextMenu(e, el));
      el.addEventListener("click", (e) => showTaskDetails(e, el));
      el.dataset.listenersAttached = "true";
    }
  });

  // Sort items according to time and priority
  items.sort((a, b) => {
    // Group by done status first (done items go to the bottom)
    const aIsTaskDone =
      a.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE) === "completed";
    const bIsTaskDone =
      b.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE) === "completed";
    const aIsPlanningDone =
      a.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.DONE) === "true";
    const bIsPlanningDone =
      b.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.DONE) === "true";

    if (aIsPlanningDone !== bIsPlanningDone) {
      return aIsPlanningDone ? 1 : -1; // planning done goes down
    }

    if (aIsTaskDone !== bIsTaskDone) {
      return aIsTaskDone ? 1 : -1; // task done goes down
    }

    // Then by time and priority
    const aTime = parsePlanningTimeRange(
      a.querySelector(".planning-hour")?.textContent || "",
    );
    const bTime = parsePlanningTimeRange(
      b.querySelector(".planning-hour")?.textContent || "",
    );

    if (aTime.start !== bTime.start) return aTime.start - bTime.start;
    if (aTime.end !== bTime.end) return aTime.end - bTime.end;

    const getPriority = (el) => {
      const fill = el.querySelector(".priority-fill");
      let p =
        fill?.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.PRIORITY) ||
        (fill ? extractPriorityFromClasses(fill) : null) ||
        "0";
      const n = parseInt(p, 10);
      return Number.isNaN(n) ? 0 : n;
    };

    const aPriority = getPriority(a);
    const bPriority = getPriority(b);
    return bPriority - aPriority; // higher priority first
  });

  // Re-append in sorted order
  items.forEach((el) => listEl.appendChild(el));

  // Update placeholder / no-plannings state
  updateNoPlanningsState(listEl);
}

// keep old name as simple wrapper for backward compatibility
function sortPlannings(listEl) {
  return orderAndApplyClasses(listEl);
}

function updateNoPlanningsState(listEl) {
  const count = listEl.querySelectorAll(
    `.${APP_CONFIG.CLASSES.PLANNING_ITEM}`,
  ).length;
  let placeholder = listEl.querySelector(`.${APP_CONFIG.CLASSES.NO_PLANNINGS}`);
  if (count === 0) {
    if (!placeholder) {
      placeholder = document.createElement("li");
      placeholder.className = `list-group-item text-center text-muted ${APP_CONFIG.CLASSES.NO_PLANNINGS}`;
      placeholder.textContent = "No plannings for this day.";
      listEl.appendChild(placeholder);
    }
  } else if (placeholder) {
    placeholder.remove();
  }
}

// Drag handlers
function onDragStart(ev) {
  const el = ev.currentTarget;
  el.classList.add(APP_CONFIG.CLASSES.DRAGGING);
  dndState.draggedElement = el;
  dndState.draggedPlanningId =
    el.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.PLANNING_ID) || "";
  dndState.originalDate =
    el.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.CURRENT_DATE) || "";
  ev.dataTransfer.effectAllowed = "move";
  ev.dataTransfer.setData("text/plain", dndState.draggedPlanningId);
}

async function onDropToDuplicate(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  const zone = ev.currentTarget;
  const card = zone.closest(".card");
  const newDate = card.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.DATE);

  zone.classList.remove(APP_CONFIG.CLASSES.DRAG_OVER);

  if (!newDate || !dndState.draggedElement) {
    resetDragState();
    return;
  }

  const taskId = dndState.draggedElement.getAttribute(
    APP_CONFIG.DATA_ATTRIBUTES.TASK_ID,
  );
  const priorityElement =
    dndState.draggedElement.querySelector(".priority-fill");

  // Get priority from the planning (not the task)
  let priority = 3; // default priority
  if (priorityElement) {
    const priorityAttr = priorityElement.getAttribute(
      APP_CONFIG.DATA_ATTRIBUTES.PRIORITY,
    );
    if (priorityAttr) {
      priority = parseInt(priorityAttr, 10);
      if (isNaN(priority)) priority = 3;
    }
  }

  const payload = {
    task_id: parseInt(taskId, 10),
    planned_date: newDate,
    priority: priority,
  };

  console.log("Duplicating planning with payload:", payload);

  try {
    const newPlanning = await makeApiRequest(
      `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/`,
      "POST",
      payload,
    );

    console.log("API response:", newPlanning);

    if (newPlanning && newPlanning.id) {
      // Check if the response includes complete task data
      if (!newPlanning.task || !newPlanning.task.id) {
        console.warn(
          "API response missing task data, attempting to reconstruct from original element",
        );

        // Try to get task details from the original dragged element
        const originalTaskTitle = dndState.draggedElement
          .querySelector(".planning-task")
          ?.textContent?.trim();
        const originalTaskState = dndState.draggedElement.getAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE,
        );

        // Extract task priority from the original element
        let originalTaskPriority = null;
        const taskPriorityAttr =
          dndState.draggedElement.getAttribute("data-task-priority");
        if (taskPriorityAttr) {
          originalTaskPriority = parseInt(taskPriorityAttr, 10);
        } else {
          // Try to extract from priority circle if data attribute is missing
          const priorityCircle =
            dndState.draggedElement.querySelector(".priority-circle");
          if (priorityCircle) {
            const priorityText = priorityCircle.textContent?.trim();
            if (priorityText && !isNaN(parseInt(priorityText, 10))) {
              originalTaskPriority = parseInt(priorityText, 10);
            }
          }
        }

        // Create a minimal task object with available data
        newPlanning.task = {
          id: payload.task_id,
          title: originalTaskTitle || "Unknown Task",
          state: originalTaskState || "pending",
          priority: originalTaskPriority,
          project: null,
        };
      }

      addPlanningToDOM(newPlanning, newDate);
      showNotification("Planificación duplicada exitosamente", "success");
    } else {
      throw new Error("Invalid response from server - missing planning ID");
    }
  } catch (err) {
    console.error("Error duplicating planning:", err);
    showNotification(`Error: ${err.message}`, "error");
  } finally {
    resetDragState();
  }
}

function allowDrop(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function onDragEnter(ev) {
  const zone = ev.currentTarget;
  zone.classList.add(APP_CONFIG.CLASSES.DRAG_OVER);
  const placeholder = zone.querySelector(`.${APP_CONFIG.CLASSES.NO_PLANNINGS}`);
  if (placeholder) {
    placeholder.textContent = "Drop here to move planning";
    placeholder.classList.add(APP_CONFIG.CLASSES.DRAG_OVER_TEXT);
  }
}

function onDragLeave(ev) {
  const zone = ev.currentTarget;
  const rect = zone.getBoundingClientRect();
  // Only clear if cursor is truly outside
  if (
    ev.clientX < rect.left ||
    ev.clientX > rect.right ||
    ev.clientY < rect.top ||
    ev.clientY > rect.bottom
  ) {
    zone.classList.remove(APP_CONFIG.CLASSES.DRAG_OVER);
    const placeholder = zone.querySelector(
      `.${APP_CONFIG.CLASSES.NO_PLANNINGS}`,
    );
    if (placeholder) {
      placeholder.textContent = "No plannings for this day.";
      placeholder.classList.remove(APP_CONFIG.CLASSES.DRAG_OVER_TEXT);
    }
  }
}

async function onDropToDay(ev) {
  ev.preventDefault();
  const zone = ev.currentTarget;
  const newDate = zone.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.DATE);

  zone.classList.remove(APP_CONFIG.CLASSES.DRAG_OVER);
  const placeholder = zone.querySelector(`.${APP_CONFIG.CLASSES.NO_PLANNINGS}`);
  if (placeholder) {
    placeholder.textContent = "No plannings for this day.";
    placeholder.classList.remove(APP_CONFIG.CLASSES.DRAG_OVER_TEXT);
  }

  if (
    !newDate ||
    newDate === dndState.originalDate ||
    !dndState.draggedElement
  ) {
    resetDragState();
    return;
  }

  // Check if the planning is done and needs to be deselected
  const isDone =
    dndState.draggedElement.classList.contains(APP_CONFIG.CLASSES.DONE) ||
    dndState.draggedElement.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.DONE) ===
      "true";
  let apiData = { planned_date: newDate };
  if (isDone) {
    apiData.done = false;
  }

  try {
    await makeApiRequest(
      `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
      "PATCH",
      apiData,
    );
    movePlanningInDOM(
      dndState.draggedElement,
      newDate,
      dndState.originalDate,
      isDone,
    );
    showNotification("Planificación movida exitosamente", "success");
  } catch (err) {
    console.error("Error moving planning to new date:", err);
  } finally {
    resetDragState();
  }
}

async function onDropToAction(ev) {
  ev.preventDefault();
  const zone = ev.currentTarget;

  zone.classList.remove(APP_CONFIG.CLASSES.DRAG_OVER);
  if (!dndState.draggedElement) {
    resetDragState();
    return;
  }

  const action = zone.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.ACTION);

  try {
    switch (action) {
      case "delete": {
        await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
          "DELETE",
        );
        const parentList = dndState.draggedElement.parentElement;
        dndState.draggedElement.remove();
        updateNoPlanningsState(parentList);
        showNotification("Planificación eliminada exitosamente", "success");
        break;
      }
      case "priority": {
        const newPriority = parseInt(
          zone.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.PRIORITY),
          10,
        );
        await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
          "PATCH",
          { priority: newPriority },
        );
        const parentList = dndState.draggedElement.closest(".list-group");
        const bar = dndState.draggedElement.querySelector(".priority-fill");
        if (bar) {
          bar.setAttribute(
            APP_CONFIG.DATA_ATTRIBUTES.PRIORITY,
            String(newPriority),
          );
        }
        applyPlanningVisualState(dndState.draggedElement);
        if (parentList) orderAndApplyClasses(parentList);
        showNotification(
          "Prioridad de planificación actualizada exitosamente",
          "success",
        );
        break;
      }
      case "complete": {
        const currentlyDone =
          dndState.draggedElement.getAttribute(
            APP_CONFIG.DATA_ATTRIBUTES.DONE,
          ) === "true" ||
          dndState.draggedElement.classList.contains(APP_CONFIG.CLASSES.DONE);

        const newDone = !currentlyDone;
        await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
          "PATCH",
          { done: newDone },
        );
        dndState.draggedElement.setAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.DONE,
          newDone ? "true" : "false",
        );
        const parentList = dndState.draggedElement.closest(".list-group");
        orderAndApplyClasses(parentList);
        showNotification(
          newDone
            ? "Planificación marcada como completada"
            : "Planificación desmarcada como completada",
          "success",
        );
        break;
      }
      case "complete-task": {
        const taskId = dndState.draggedElement.getAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_ID,
        );
        const taskState = dndState.draggedElement.getAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE,
        );
        if (!taskId) {
          showNotification(
            "ID de tarea no encontrado para esta planificación.",
            "error",
          );
          return;
        }
        // Toggle between completed and pending
        let newState = "completed";
        if (taskState === "completed") {
          newState = "pending";
        }
        await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/tasks/${taskId}`,
          "PATCH",
          { state: newState },
        );
        dndState.draggedElement.setAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE,
          newState,
        );
        const parentList = dndState.draggedElement.closest(".list-group");
        orderAndApplyClasses(parentList);
        showNotification(
          newState === "completed"
            ? "Tarea marcada como hecha"
            : "Tarea marcada como no hecha",
          "success",
        );
        break;
      }
      case "in-progress": {
        const taskId = dndState.draggedElement.getAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_ID,
        );
        const taskState = dndState.draggedElement.getAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE,
        );
        if (!taskId) {
          showNotification(
            "ID de tarea no encontrado para esta planificación.",
            "error",
          );
          return;
        }
        // Toggle between in_progress and pending
        let newState = "in_progress";
        if (taskState === "in_progress") {
          newState = "pending";
        }
        await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/tasks/${taskId}`,
          "PATCH",
          { state: newState },
        );
        dndState.draggedElement.setAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE,
          newState,
        );
        const parentList = dndState.draggedElement.closest(".list-group");
        orderAndApplyClasses(parentList);
        showNotification(
          newState === "in_progress"
            ? "Tarea marcada como en progreso"
            : "Tarea marcada como pendiente",
          "success",
        );
        break;
      }
      default:
        console.warn("Unknown action:", action);
    }
  } catch (err) {
    console.error("Error applying action:", err);
    showNotification(`Error: ${err.message}`, "error");
  } finally {
    resetDragState();
  }
}

function resetDragState() {
  if (dndState.draggedElement) {
    dndState.draggedElement.classList.remove(APP_CONFIG.CLASSES.DRAGGING);
  }
  dndState.draggedElement = null;
  dndState.draggedPlanningId = null;
  dndState.originalDate = null;
}

function addPlanningToDOM(planning, date) {
  const listEl = document.getElementById(`plannings-${date}`);
  if (!listEl) {
    console.error(`Cannot find list element with ID: plannings-${date}`);
    return;
  }

  // Validate planning object structure
  if (!planning || !planning.id) {
    console.error("Invalid planning object:", planning);
    return;
  }

  // If task data is incomplete, we need to fetch it or use fallback values
  if (!planning.task || !planning.task.id) {
    console.error("Planning missing task data:", planning);
    showNotification("Error: Planning missing task information", "error");
    return;
  }

  // Remove the "no plannings" placeholder if it exists
  const placeholder = listEl.querySelector(
    `.${APP_CONFIG.CLASSES.NO_PLANNINGS}`,
  );
  if (placeholder) {
    placeholder.remove();
  }

  const itemEl = document.createElement("li");

  // Safe access to task properties with fallbacks
  const taskStatus = planning.task.status || planning.task.state || "pending";
  const taskState = planning.task.state || "pending";
  const taskTitle = planning.task.title || "Unknown Task";
  const taskPriority = planning.task.priority || null;

  itemEl.className = `list-group-item planning-item ${planning.done || taskStatus === "DONE" || taskState === "completed" ? "planning-done" : ""}`;
  itemEl.setAttribute("draggable", "true");
  itemEl.setAttribute(APP_CONFIG.DATA_ATTRIBUTES.PLANNING_ID, planning.id);
  itemEl.setAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_ID, planning.task.id);
  itemEl.setAttribute(APP_CONFIG.DATA_ATTRIBUTES.CURRENT_DATE, date);
  itemEl.setAttribute(
    APP_CONFIG.DATA_ATTRIBUTES.DONE,
    planning.done ? "true" : "false",
  );
  itemEl.setAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_STATE, taskState);

  // Store task priority as data attribute for applyPlanningVisualState
  if (taskPriority) {
    itemEl.setAttribute("data-task-priority", taskPriority);
  }

  let timeDisplay = "";
  if (planning.start_hour && planning.end_hour) {
    timeDisplay = `${planning.start_hour.substring(0, 5)} - ${planning.end_hour.substring(0, 5)}`;
  } else if (planning.start_hour) {
    timeDisplay = planning.start_hour.substring(0, 5);
  }

  let projectBadge = "Sin Proyecto";
  if (planning.task.project && planning.task.project.name) {
    projectBadge = planning.task.project.name;
  }

  // Generate icon based on task state
  let taskStateIcon = "";
  if (taskState === "completed") {
    taskStateIcon = '<i class="fas fa-check-circle planning-icon"></i>';
  } else if (taskState === "in_progress") {
    taskStateIcon = '<i class="fas fa-spinner planning-icon"></i>';
  }

  itemEl.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">
      <div class="planning-content">
        <strong class="planning-task">
          ${taskTitle}
          ${
            taskPriority
              ? `<span class="priority-circle priority-${taskPriority}" title="Priority ${taskPriority}">${taskPriority}</span>`
              : ""
          }
        </strong>
        ${taskStateIcon}
        <span class="planning-hour text-muted">${timeDisplay}</span>
      </div>
      <span class="badge bg-secondary">${projectBadge}</span>
    </div>
    <div class="priority-line mt-2">
      <div class="priority-fill priority-${planning.priority || 0}" data-priority="${planning.priority || 0}"></div>
    </div>
  `;

  listEl.appendChild(itemEl);

  // Ensure the new element has event listeners attached
  itemEl.addEventListener("dragstart", onDragStart);
  itemEl.addEventListener("contextmenu", (e) => showTimeContextMenu(e, itemEl));
  itemEl.addEventListener("click", (e) => showTaskDetails(e, itemEl));
  itemEl.dataset.listenersAttached = "true";

  // Apply visual state and sort the list
  applyPlanningVisualState(itemEl);
  orderAndApplyClasses(listEl);
}

function movePlanningInDOM(itemEl, newDate, oldDate, wasDone = false) {
  const oldList = document.getElementById(`plannings-${oldDate}`);
  const newList = document.getElementById(`plannings-${newDate}`);

  if (!oldList || !newList) {
    console.error("Invalid containers for planning move");
    return;
  }

  // Update the stored date attribute
  itemEl.setAttribute(APP_CONFIG.DATA_ATTRIBUTES.CURRENT_DATE, newDate);
  itemEl.classList.remove(APP_CONFIG.CLASSES.DRAGGING);

  if (wasDone) {
    itemEl.setAttribute(APP_CONFIG.DATA_ATTRIBUTES.DONE, "false");
  }
  // Re-apply canonical classes
  applyPlanningVisualState(itemEl);

  newList.appendChild(itemEl);

  // Normalize & sort both lists
  orderAndApplyClasses(newList);
  orderAndApplyClasses(oldList);
}

// Context menu (time picker) handling
function hideTimeContextMenu() {
  const menu = document.getElementById("time-context-menu");
  if (!menu) return;

  menu.style.display = "none";

  // Clean listeners by replacing nodes
  const saveBtn = menu.querySelector("#save-time");
  const cancelBtn = menu.querySelector("#cancel-time");
  if (saveBtn) saveBtn.replaceWith(saveBtn.cloneNode(true));
  if (cancelBtn) cancelBtn.replaceWith(cancelBtn.cloneNode(true));
}

function showTimeContextMenu(ev, itemEl) {
  ev.preventDefault();
  hideTimeContextMenu();

  const planningId = itemEl.getAttribute(
    APP_CONFIG.DATA_ATTRIBUTES.PLANNING_ID,
  );
  const menu = document.getElementById("time-context-menu");
  if (!menu) return;

  menu.style.left = `${ev.clientX + 5}px`;
  menu.style.top = `${ev.clientY + 5}px`;
  menu.style.display = "block";

  const startInput = menu.querySelector("#start-time");
  const endInput = menu.querySelector("#end-time");
  const saveBtn = menu.querySelector("#save-time");
  const cancelBtn = menu.querySelector("#cancel-time");

  const onSave = async () => {
    const startValue = startInput?.value || "";
    const endValue = endInput?.value || "";
    if (!startValue && !endValue) {
      hideTimeContextMenu();
      return;
    }
    try {
      await makeApiRequest(
        `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/${planningId}`,
        "PATCH",
        {
          start_hour: startValue || null,
          end_hour: endValue || null,
        },
      );

      const hourEl = itemEl.querySelector(".planning-hour");
      if (hourEl) {
        hourEl.textContent =
          startValue && endValue
            ? `${startValue} - ${endValue}`
            : startValue || "";
      }

      const list = itemEl.closest(".list-group");
      if (list) sortPlannings(list);

      showNotification("Hora actualizada exitosamente", "success");
    } catch (err) {
      console.error("Error updating time:", err);
    } finally {
      hideTimeContextMenu();
    }
  };

  saveBtn?.addEventListener("click", onSave);
  cancelBtn?.addEventListener("click", hideTimeContextMenu);
}

function onGlobalClick(ev) {
  const menu = document.getElementById("time-context-menu");
  if (!menu) return;
  const isOpen = menu.style.display === "block";
  if (!isOpen) return;

  const clickedInsideMenu = menu.contains(ev.target);
  const clickedOnPlanning = ev.target.closest?.(
    `.${APP_CONFIG.CLASSES.PLANNING_ITEM}`,
  );
  if (!clickedInsideMenu && !clickedOnPlanning) {
    hideTimeContextMenu();
  }
}

function setupEventListeners() {
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", allowDrop);
    zone.addEventListener("dragenter", onDragEnter);
    zone.addEventListener("dragleave", onDragLeave);
    zone.addEventListener("drop", onDropToDay);
  });

  document.querySelectorAll(".drop-zone-duplicate").forEach((zone) => {
    zone.addEventListener("dragover", allowDrop);
    zone.addEventListener("dragenter", onDragEnter);
    zone.addEventListener("dragleave", onDragLeave);
    zone.addEventListener("drop", onDropToDuplicate);
  });

  document.querySelectorAll(".action-zone").forEach((zone) => {
    zone.addEventListener("dragover", allowDrop);
    zone.addEventListener("dragenter", onDragEnter);
    zone.addEventListener("dragleave", onDragLeave);
    zone.addEventListener("drop", onDropToAction);
  });

  // Planning items
  document
    .querySelectorAll(`.${APP_CONFIG.CLASSES.PLANNING_ITEM}`)
    .forEach((item) => {
      item.addEventListener("dragstart", onDragStart);
      item.addEventListener("contextmenu", (e) => showTimeContextMenu(e, item));
      item.addEventListener("click", (e) => showTaskDetails(e, item)); // uses global showTaskDetails
    });

  document.addEventListener("click", onGlobalClick);
}

function initializeExistingPlannings() {
  // Initialize all existing planning lists on page load
  document.querySelectorAll('[id^="plannings-"]').forEach((listEl) => {
    orderAndApplyClasses(listEl);
  });
}

// ensure lists are initialized once file loads (will be re-checked by observer on changes)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    initializeExistingPlannings();
  });
} else {
  setupEventListeners();
  initializeExistingPlannings();
}
