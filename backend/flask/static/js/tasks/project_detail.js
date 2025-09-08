document.addEventListener("DOMContentLoaded", () => {
  const config = {
    selectors: {
      planningPopup: "#task-planning-menu",
      taskItems: ".task-item",
      daysContainer: "#planning-days",
      taskIdInput: "#planning-task-id",
      saveButton: "#save-planning",
      cancelButton: ".cancel-planning",
      priorityButtons: ".priority-btn",
      prioritiesContainer: "#planning-priorities",
      startTimeInput: "#planning-start-time",
      endTimeInput: "#planning-end-time",
      dateInput: "#planning-date",
      dateButton: "#planning-date-btn",
    },
    classes: { active: "selected", visible: "visible" },
    dayNames: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
  };

  const state = { selectedDate: null, selectedPriority: null };

  const planningPopup = document.querySelector(config.selectors.planningPopup);
  if (!planningPopup) return;
  const taskItems = document.querySelectorAll(config.selectors.taskItems);
  const daysContainer = document.querySelector(config.selectors.daysContainer);
  const taskIdInput = document.querySelector(config.selectors.taskIdInput);
  const saveButton = document.querySelector(config.selectors.saveButton);
  const cancelButtons = document.querySelectorAll(
    config.selectors.cancelButton,
  );
  const prioritiesContainer = document.querySelector(
    config.selectors.prioritiesContainer,
  );
  const startTimeInput = document.querySelector(
    config.selectors.startTimeInput,
  );
  const endTimeInput = document.querySelector(config.selectors.endTimeInput);
  const dateInput = document.querySelector(config.selectors.dateInput);
  const dateButton = document.querySelector(config.selectors.dateButton);

  // Add event listener for date button
  if (dateButton && dateInput) {
    dateButton.addEventListener("click", (e) => {
      e.preventDefault();
      dateInput.click();
    });
  }

  // Add event listener for date input
  if (dateInput) {
    dateInput.addEventListener("change", (e) => {
      state.selectedDate = e.target.value;
      // Clear day selection
      const activeDay = daysContainer.querySelector(
        `.${config.classes.active}`,
      );
      if (activeDay) activeDay.classList.remove(config.classes.active);
      // Update button appearance
      if (dateButton) {
        dateButton.classList.add(config.classes.active);
      }
    });
  }

  const showPopup = (event) => {
    event.preventDefault();
    const taskItem = event.currentTarget;
    const taskId = taskItem.dataset.taskId;
    taskIdInput.value = taskId;
    populateNextFourDays();
    resetPopup();
    const rect = taskItem.getBoundingClientRect();
    planningPopup.classList.add(config.classes.visible);
    planningPopup.style.top = `${rect.bottom}px`;
    planningPopup.style.left = `${rect.left}px`;
  };
  const hidePopup = () => {
    planningPopup.classList.remove(config.classes.visible);
  };
  const resetPopup = () => {
    state.selectedDate = null;
    state.selectedPriority = null;
    startTimeInput.value = "";
    endTimeInput.value = "";
    dateInput.value = "";
    if (dateButton) {
      dateButton.classList.remove(config.classes.active);
    }
    const activeDay = daysContainer.querySelector(`.${config.classes.active}`);
    if (activeDay) activeDay.classList.remove(config.classes.active);
    const activePriority = prioritiesContainer.querySelector(
      `.${config.classes.active}`,
    );
    if (activePriority) activePriority.classList.remove(config.classes.active);
  };
  const handleSave = async () => {
    if (!state.selectedDate) {
      showNotification("Por favor selecciona un día.", "warning");
      return;
    }
    const payload = {
      task_id: taskIdInput.value,
      planned_date: state.selectedDate,
      priority: state.selectedPriority,
      start_time: startTimeInput.value || null,
      end_time: endTimeInput.value || null,
    };
    try {
      const response = await makeApiRequest(
        `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/`,
        "POST",
        payload,
      );
      if (response) {
        showNotification("¡Planificación guardada exitosamente!", "success");
        hidePopup();
      }
    } catch (error) {
      console.error("Error saving planning:", error);
      showNotification(`Error: ${error.message}`, "danger");
    }
  };
  const populateNextFourDays = () => {
    daysContainer.innerHTML = "";
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("btn", "btn-outline-secondary", "btn-sm");
      button.dataset.date = date.toISOString().split("T")[0];
      let dayLabel = config.dayNames[date.getDay()].substring(0, 3);
      button.textContent = `${dayLabel} ${date.getDate()}`;
      button.addEventListener("click", (e) => {
        const currentActive = daysContainer.querySelector(
          `.${config.classes.active}`,
        );
        if (currentActive) {
          currentActive.classList.remove(config.classes.active);
        }
        e.currentTarget.classList.add(config.classes.active);
        state.selectedDate = e.currentTarget.dataset.date;
        // Clear date input
        if (dateInput) {
          dateInput.value = "";
        }
        if (dateButton) {
          dateButton.classList.remove(config.classes.active);
        }
      });
      daysContainer.appendChild(button);
    }
  };
  const handlePrioritySelection = (e) => {
    const selectedBtn = e.currentTarget;
    const priority = selectedBtn.dataset.priority;
    if (selectedBtn.classList.contains(config.classes.active)) {
      selectedBtn.classList.remove(config.classes.active);
      state.selectedPriority = null;
    } else {
      const priorityButtons = prioritiesContainer.querySelectorAll(
        config.selectors.priorityButtons,
      );
      priorityButtons.forEach((btn) =>
        btn.classList.remove(config.classes.active),
      );
      selectedBtn.classList.add(config.classes.active);
      state.selectedPriority = priority;
    }
  };
  taskItems.forEach((item) => item.addEventListener("contextmenu", showPopup));
  cancelButtons.forEach((btn) => btn.addEventListener("click", hidePopup));
  saveButton.addEventListener("click", handleSave);
  prioritiesContainer
    .querySelectorAll(config.selectors.priorityButtons)
    .forEach((btn) => btn.addEventListener("click", handlePrioritySelection));
  document.addEventListener("click", (e) => {
    if (
      planningPopup.classList.contains(config.classes.visible) &&
      !planningPopup.contains(e.target) &&
      !e.target.closest(config.selectors.taskItems)
    ) {
      hidePopup();
    }
  });
  taskItems.forEach((item) =>
    item.addEventListener("click", (e) => showTaskDetails(e, item)),
  );
});
