document.addEventListener("DOMContentLoaded", () => {
  window.ProjectTaskHandlersLoaded = true;

  const projectModalEl = document.getElementById("projectModal");
  const projectModal = projectModalEl
    ? new bootstrap.Modal(projectModalEl)
    : null;
  const btnOpenProjectModal = document.getElementById("btn-open-project-modal");
  const btnEditProject = document.getElementById("btn-edit-project");
  const saveProjectBtn = document.getElementById("save-project");

  const projectIdInput = document.getElementById("project-id");
  const projectNameInput = document.getElementById("project-name");
  const projectDescriptionInput = document.getElementById(
    "project-description",
  );
  const projectStartInput = document.getElementById("project-start");
  const projectEndInput = document.getElementById("project-end");
  const projectStateSelect = document.getElementById("project-state");
  const projectModalLabel = document.getElementById("projectModalLabel");

  const projectDetailName = document.getElementById("project-detail-name");
  const projectDetailDescription = document.getElementById(
    "project-detail-description",
  );
  const projectDetailState = document.getElementById("project-detail-state");
  const projectDetailDates = document.getElementById("project-detail-dates");

  const taskModalEl = document.getElementById("taskEditModal");
  const taskModal = taskModalEl ? new bootstrap.Modal(taskModalEl) : null;
  const btnAddTask = document.getElementById("btn-add-task");
  const saveTaskBtn = document.getElementById("save-task");

  const taskIdInput = document.getElementById("task-id");
  const taskProjectIdInput = document.getElementById("task-project-id");
  const taskTitleInput = document.getElementById("task-title");
  const taskDescriptionInput = document.getElementById("task-description");
  const taskDueDateInput = document.getElementById("task-due-date");
  const taskStateSelect = document.getElementById("task-state");
  const taskModalLabel = document.getElementById("taskEditModalLabel");

  const tasksList = document.getElementById("project-tasks-list");

  if (tasksList) {
    tasksList.addEventListener("click", async (e) => {
      const delBtn = e.target.closest && e.target.closest(".btn-delete-task");
      if (!delBtn) return;
      e.preventDefault();
      e.stopPropagation();
      const taskId = delBtn.getAttribute("data-task-id");
      if (!taskId) return;
      try {
        await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/tasks/${taskId}`,
          "DELETE",
        );
        const li = tasksList.querySelector(
          `.task-item[data-task-id='${taskId}']`,
        );
        if (li) li.remove();
        showNotification("Tarea eliminada", "success");
        if (!tasksList.querySelector(".task-item")) {
          const placeholder = document.createElement("li");
          placeholder.className = "list-group-item text-center text-muted";
          placeholder.textContent = "No tasks for this project.";
          tasksList.appendChild(placeholder);
        }
      } catch (err) {}
    });
  }

  const clearProjectForm = () => {
    if (!projectIdInput) return;
    projectIdInput.value = "";
    projectNameInput.value = "";
    projectDescriptionInput.value = "";
    projectStartInput.value = "";
    projectEndInput.value = "";
    projectStateSelect.value = "not_started";
  };

  const fillProjectForm = (data) => {
    if (!data) return;
    projectIdInput.value = data.id || "";
    projectNameInput.value = data.name || "";
    projectDescriptionInput.value = data.description || "";
    projectStartInput.value = data.expected_start_date || "";
    projectEndInput.value = data.expected_end_date || "";
    if (data.state) projectStateSelect.value = data.state;
  };

  const clearTaskForm = () => {
    if (!taskIdInput) return;
    taskIdInput.value = "";
    taskTitleInput.value = "";
    taskDescriptionInput.value = "";
    taskDueDateInput.value = "";
    taskStateSelect.value = "pending";
  };

  const fillTaskForm = (data) => {
    taskIdInput.value = data.id || "";
    taskTitleInput.value = data.title || "";
    taskDescriptionInput.value = data.description || "";
    taskDueDateInput.value = data.due_date || "";
    if (data.state) taskStateSelect.value = data.state;
    if (data.project_id) taskProjectIdInput.value = data.project_id;
  };

  btnOpenProjectModal &&
    btnOpenProjectModal.addEventListener("click", () => {
      clearProjectForm();
      projectModalLabel.textContent = "New Project";
      projectModal && projectModal.show();
    });

  btnEditProject &&
    btnEditProject.addEventListener("click", async (e) => {
      const pid = e.currentTarget.getAttribute("data-project-id");
      if (!pid) return;
      try {
        const data = await makeApiRequest(
          `${APP_CONFIG.API_BASE_URL}/tasks/projects/${pid}`,
          "GET",
        );
        clearProjectForm();
        fillProjectForm(data);
        projectModalLabel.textContent = "Edit Project";
        projectModal && projectModal.show();
      } catch (err) {}
    });

  saveProjectBtn &&
    saveProjectBtn.addEventListener("click", async () => {
      if (!projectNameInput.value.trim()) {
        showNotification("El nombre es obligatorio", "warning");
        return;
      }
      const payload = {
        name: projectNameInput.value.trim(),
        description: projectDescriptionInput.value.trim() || null,
        expected_start_date: projectStartInput.value || null,
        expected_end_date: projectEndInput.value || null,
        state: projectStateSelect.value,
      };
      const pid = projectIdInput.value;
      const method = pid ? "PUT" : "POST";
      const url = pid
        ? `${APP_CONFIG.API_BASE_URL}/tasks/projects/${pid}`
        : `${APP_CONFIG.API_BASE_URL}/tasks/projects/`;
      try {
        await makeApiRequest(url, method, payload);
        showNotification("Proyecto guardado", "success");
        projectModal && projectModal.hide();
        window.location.reload();
      } catch (err) {}
    });

  btnAddTask &&
    btnAddTask.addEventListener("click", () => {
      clearTaskForm();
      const projectId = btnAddTask.getAttribute("data-project-id");
      taskProjectIdInput.value = projectId || "";
      taskModalLabel.textContent = "New Task";
      taskModal && taskModal.show();
    });

  saveTaskBtn &&
    saveTaskBtn.addEventListener("click", async () => {
      if (!taskTitleInput.value.trim()) {
        showNotification("El título es obligatorio", "warning");
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
        showNotification("Tarea guardada", "success");
        taskModal && taskModal.hide();
        window.location.reload();
      } catch (err) {}
    });
});
