const showTaskDetails = async (event, planningItem) => {
  event.preventDefault();
  const taskId = planningItem.getAttribute(APP_CONFIG.DATA_ATTRIBUTES.TASK_ID);
  if (!taskId) return;

  try {
    const task = await makeApiRequest(
      `${APP_CONFIG.API_BASE_URL}/tasks/tasks/${taskId}/general-info`,
      "GET",
    );

    safeSetTextContent("taskTitle", task.title || "Untitled Task");
    safeSetTextContent("taskDueDate", formatDate(task.due_date));
    safeSetTextContent(
      "taskDescription",
      task.description || "No description available",
    );

    const statusElement = document.getElementById("taskStatus");
    if (statusElement) {
      const status = task.state || "unknown";
      statusElement.textContent = formatStatus(status);
      statusElement.className = getStatusCssClass(status);
    }

    const projectSection = document.getElementById("projectSection");
    if (task.project) {
      safeSetTextContent("projectName", task.project.name);
      const projectStatusElement = document.getElementById("projectStatus");
      const projectStatus = task.project.state || "unknown";
      projectStatusElement.textContent = formatStatus(projectStatus);
      projectStatusElement.className = getStatusCssClass(projectStatus);
      projectSection.style.display = "block";
    } else if (projectSection) {
      projectSection.style.display = "none";
    }

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

    const taskModalElement = document.getElementById("taskDetailModal");
    if (taskModalElement) {
      taskModalElement.dataset.currentTaskId = taskId;
      taskModalElement.dataset.projectId = task.project
        ? task.project.id
        : task.project_id || "";
    }

    const modal = new bootstrap.Modal(
      document.getElementById("taskDetailModal"),
    );
    modal.show();
  } catch (error) {
    console.error("Error loading task details:", error);
    showNotification("Failed to load task details", "danger");
  }
};

function openStackedModal(currentModalEl, newModalEl) {
  if (!newModalEl) return;
  const openModals = document.querySelectorAll(".modal.show");
  const baseZ = 1050;
  newModalEl.style.zIndex = baseZ + openModals.length * 20;
  const backdrops = document.querySelectorAll(".modal-backdrop");
  backdrops.forEach((bd, idx) => {
    bd.style.zIndex = 1040 + idx * 20;
  });
  const newModal = new bootstrap.Modal(newModalEl);
  newModal.show();
  const firstInput = newModalEl.querySelector("input, textarea, select");
  if (firstInput) setTimeout(() => firstInput.focus(), 300);
}

document.addEventListener("DOMContentLoaded", () => {
  const attachHandler = () => {
    const editFromDetailBtn = document.getElementById(
      "open-edit-task-from-detail",
    );
    if (!editFromDetailBtn) return;
    if (editFromDetailBtn.dataset.listenerAttached) return;
    editFromDetailBtn.dataset.listenerAttached = "1";
    editFromDetailBtn.addEventListener("click", async () => {
      const taskModalElement = document.getElementById("taskDetailModal");
      if (!taskModalElement) return;
      const taskId = taskModalElement.dataset.currentTaskId;
      if (!taskId) {
        showNotification("Task not loaded", "warning");
        return;
      }
      try {
        const data = await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/tasks/${taskId}`,
          "GET",
        );
        const taskEditModalEl = document.getElementById("taskEditModal");
        if (!taskEditModalEl) {
          showNotification("Edit modal not available", "danger");
          return;
        }
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

        openStackedModal(taskModalElement, taskEditModalEl);

        setTimeout(() => {
          const visibleEdit = taskEditModalEl.classList.contains("show");
          if (!visibleEdit) return;
          const detailVisible = taskModalElement.classList.contains("show");
          if (detailVisible) {
            const editRect = taskEditModalEl.getBoundingClientRect();
            if (editRect.width === 0 || editRect.height === 0) {
              const detailInstance =
                bootstrap.Modal.getInstance(taskModalElement);
              if (detailInstance) {
                taskEditModalEl.addEventListener(
                  "shown.bs.modal",
                  () => {
                    const firstInput = taskEditModalEl.querySelector(
                      "input, textarea, select",
                    );
                    if (firstInput) setTimeout(() => firstInput.focus(), 150);
                  },
                  { once: true },
                );
                detailInstance.hide();
                const editInstance =
                  bootstrap.Modal.getInstance(taskEditModalEl) ||
                  new bootstrap.Modal(taskEditModalEl);
                editInstance.show();
              }
            }
          }
        }, 600);
      } catch (e) {}
    });
  };

  attachHandler();
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "open-edit-task-from-detail")
      attachHandler();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.ProjectTaskHandlersLoaded) return;
  const saveTaskBtn = document.getElementById("save-task");
  const taskIdInput = document.getElementById("task-id");
  const taskProjectIdInput = document.getElementById("task-project-id");
  const taskTitleInput = document.getElementById("task-title");
  const taskDescriptionInput = document.getElementById("task-description");
  const taskDueDateInput = document.getElementById("task-due-date");
  const taskStateSelect = document.getElementById("task-state");
  if (saveTaskBtn && !saveTaskBtn.dataset.listenerAttached) {
    saveTaskBtn.dataset.listenerAttached = "1";
    saveTaskBtn.addEventListener("click", async () => {
      if (!taskTitleInput.value.trim()) {
        showNotification("Title is required", "warning");
        return;
      }
      const payload = {
        title: taskTitleInput.value.trim(),
        description: taskDescriptionInput.value.trim() || null,
        due_date: taskDueDateInput.value || null,
        project_id: taskProjectIdInput.value
          ? parseInt(taskProjectIdInput.value)
          : null,
        state: taskStateSelect.value,
      };
      const tid = taskIdInput.value;
      const method = tid ? "PUT" : "POST";
      const url = tid
        ? `${APP_CONFIG.API_BASE_URL}/tasks/tasks/${tid}`
        : `${APP_CONFIG.API_BASE_URL}/tasks/tasks/`;
      try {
        await makeApiRequest(url, method, payload);
        showNotification("Task saved", "success");
        const taskEditModalEl = document.getElementById("taskEditModal");
        if (taskEditModalEl) {
          const inst =
            bootstrap.Modal.getInstance(taskEditModalEl) ||
            new bootstrap.Modal(taskEditModalEl);
          inst.hide();
        }
        if (
          document.getElementById("project-detail-name") ||
          document.getElementById("project-tasks-list")
        ) {
          window.location.reload();
        }
      } catch (err) {}
    });
  }
});
