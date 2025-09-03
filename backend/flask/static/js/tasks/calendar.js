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

  // 1) DONE state: task-done and planning-done are separate
  const isTaskDone =
    itemEl.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_DONE) === "true";
  const isPlanningDone =
    itemEl.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.DONE) === "true";

  // If planning is done, apply the 'task-done' class.
  itemEl.classList.toggle("planning-done", isPlanningDone);

  // If the task is done, show the checkmark icon.
  let checkmark = itemEl.querySelector(".planning-done-icon");
  if (isTaskDone) {
    if (!checkmark) {
      checkmark = document.createElement("i");
      checkmark.className = "fas fa-check-circle planning-done-icon";
      const titleEl = itemEl.querySelector(".planning-task");
      if (titleEl) {
        titleEl.parentNode.insertBefore(checkmark, titleEl.nextSibling);
      }
    }
  } else {
    if (checkmark) {
      checkmark.remove();
    }
  }

  // 2) Priority on the inner .priority-fill as: "priority-fill priority-<n>"
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
      a.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_DONE) === "true";
    const bIsTaskDone =
      b.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_DONE) === "true";
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
      `${API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
      "PATCH",
      apiData,
    );
    movePlanningInDOM(
      dndState.draggedElement,
      newDate,
      dndState.originalDate,
      isDone,
    );
    showNotification("Planning moved successfully", "success");
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
          `${API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
          "DELETE",
        );
        const parentList = dndState.draggedElement.parentElement;
        dndState.draggedElement.remove();
        updateNoPlanningsState(parentList);
        showNotification("Planning deleted successfully", "success");
        break;
      }
      case "priority": {
        const newPriority = parseInt(
          zone.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.PRIORITY),
          10,
        );
        await makeApiRequest(
          `${API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
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
        showNotification("Planning priority updated successfully", "success");
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
          `${API_BASE_URL}/tasks/task_planning/${dndState.draggedPlanningId}`,
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
            ? "Planning marked as completed"
            : "Planning unmarked as completed",
          "success",
        );
        break;
      }
      case "complete-task": {
        const taskId = dndState.draggedElement.getAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_ID,
        );
        const currentlyDone =
          dndState.draggedElement.getAttribute(
            APP_CONFIG.DATA_ATTRIBUTES.TASK_DONE,
          ) === "true";
        if (!taskId) {
          showNotification("Task ID not found for this planning.", "error");
          return;
        }
        await makeApiRequest(
          `${API_BASE_URL}/tasks/tasks/${taskId}/toggle-status`,
          "PATCH",
        );
        dndState.draggedElement.setAttribute(
          APP_CONFIG.DATA_ATTRIBUTES.TASK_DONE,
          currentlyDone ? "false" : "true",
        );
        const parentList = dndState.draggedElement.closest(".list-group");
        orderAndApplyClasses(parentList);
        showNotification(
          currentlyDone ? "Task marked as not done" : "Task marked as done",
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
        `${API_BASE_URL}/tasks/task_planning/${planningId}`,
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

      showNotification("Time updated successfully", "success");
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
  // Day columns
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", allowDrop);
    zone.addEventListener("dragenter", onDragEnter);
    zone.addEventListener("dragleave", onDragLeave);
    zone.addEventListener("drop", onDropToDay);
  });

  // Sidebar actions (complete, delete, priority)
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

// ensure lists are initialized once file loads (will be re-checked by observer on changes)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
  });
} else {
  setupEventListeners();
}
