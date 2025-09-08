// Pending Tasks Calendar JavaScript
class PendingTasksCalendar {
  constructor() {
    this.currentDate = new Date();
    this.viewMode = "month"; // 'month' or 'week'
    this.tasksData = window.tasksData || {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadTasksData();
    this.renderCalendar();
    this.setupDragAndDrop();
    this.setupTaskPlanningModal();

    // Set initial button text
    const toggleBtn = document.getElementById("view-toggle");
    if (toggleBtn) {
      toggleBtn.textContent = "Mes";
    }
  }

  setupEventListeners() {
    document
      .getElementById("prev-period")
      .addEventListener("click", () => this.navigatePeriod(-1));
    document
      .getElementById("next-period")
      .addEventListener("click", () => this.navigatePeriod(1));
    document
      .getElementById("view-toggle")
      .addEventListener("click", () => this.toggleView());
    document
      .getElementById("today-btn")
      .addEventListener("click", () => this.goToToday());
  }

  async loadTasksData() {
    try {
      // Use both server-side data and API data
      if (window.tasksData && Object.keys(window.tasksData).length > 0) {
        // Use server-side rendered data
        this.tasksData = window.tasksData;
      } else {
        // Fallback to API call
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          this.processTasksData(data);
        }
      }
    } catch (error) {
      console.error("Error loading tasks data:", error);
    }
  }

  processTasksData(tasks) {
    this.tasksData = {};
    tasks.forEach((task) => {
      if (
        task.due_date &&
        (task.state === "pending" || task.state === "in_progress")
      ) {
        const dateKey = task.due_date;
        if (!this.tasksData[dateKey]) {
          this.tasksData[dateKey] = [];
        }
        this.tasksData[dateKey].push(task);
      }
    });
  }

  navigatePeriod(direction) {
    if (this.viewMode === "month") {
      this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + direction * 7);
    }
    this.renderCalendar();
  }

  toggleView() {
    this.viewMode = this.viewMode === "month" ? "week" : "month";
    const toggleBtn = document.getElementById("view-toggle");
    toggleBtn.textContent = this.viewMode === "month" ? "Mes" : "Semana";

    // Show/hide appropriate views
    document.getElementById("month-view").style.display =
      this.viewMode === "month" ? "block" : "none";
    document.getElementById("week-view").style.display =
      this.viewMode === "week" ? "block" : "none";

    this.renderCalendar();
  }

  goToToday() {
    this.currentDate = new Date();
    this.renderCalendar();
  }

  renderCalendar() {
    if (this.viewMode === "month") {
      this.renderMonthView();
    } else {
      this.renderWeekView();
    }
    this.updatePeriodHeader();
  }

  updatePeriodHeader() {
    const headerElement = document.getElementById("current-period");
    if (this.viewMode === "month") {
      const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const monthName = monthNames[this.currentDate.getMonth()];
      const year = this.currentDate.getFullYear();
      headerElement.textContent = `${monthName} ${year}`;
    } else {
      const startOfWeek = this.getStartOfWeek(new Date(this.currentDate));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const startMonth = monthNames[startOfWeek.getMonth()];
      const endMonth = monthNames[endOfWeek.getMonth()];
      const startDay = startOfWeek.getDate();
      const endDay = endOfWeek.getDate();
      const year = endOfWeek.getFullYear();

      headerElement.textContent = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
  }

  renderMonthView() {
    const container = document.getElementById("month-calendar-body");
    container.innerHTML = "";

    const startOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0,
    );
    const startOfCalendar = this.getStartOfWeek(startOfMonth);
    const endOfCalendar = new Date(startOfCalendar);
    endOfCalendar.setDate(startOfCalendar.getDate() + 41); // 6 weeks

    let currentDay = new Date(startOfCalendar);

    while (currentDay <= endOfCalendar) {
      const dayElement = this.createDayElement(
        currentDay,
        this.currentDate.getMonth(),
      );
      container.appendChild(dayElement);
      currentDay.setDate(currentDay.getDate() + 1);
    }
  }

  renderWeekView() {
    const container = document.getElementById("week-calendar-body");
    container.innerHTML = "";

    const startOfWeek = this.getStartOfWeek(new Date(this.currentDate));

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dayElement = this.createDayElement(
        currentDay,
        this.currentDate.getMonth(),
        true,
      );
      container.appendChild(dayElement);
    }
  }

  createDayElement(date, currentMonth, isWeekView = false) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.dataset.date = this.formatDate(date);

    // Add CSS classes
    if (date.getMonth() !== currentMonth && !isWeekView) {
      dayElement.classList.add("other-month");
    }

    if (this.isToday(date)) {
      dayElement.classList.add("today");
    }

    // Day number
    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = date.getDate();
    dayElement.appendChild(dayNumber);

    // Tasks for this day
    const tasksContainer = document.createElement("div");
    tasksContainer.className = "day-tasks";

    const dateKey = this.formatDate(date);
    const dayTasks = this.tasksData[dateKey] || [];

    dayTasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "calendar-task";
      taskElement.dataset.taskId = task.id;
      taskElement.draggable = true;

      // Add priority circle if priority exists
      let taskContent = task.title;
      if (task.priority) {
        taskContent = `<span class="priority-circle priority-${task.priority}" title="Priority ${task.priority}">${task.priority}</span> ${task.title}`;
      }

      taskElement.innerHTML = taskContent;
      taskElement.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.showTaskPlanningForTask(task.id, e);
      });
      tasksContainer.appendChild(taskElement);
    });

    dayElement.appendChild(tasksContainer);

    return dayElement;
  }

  formatDate(date) {
    // Use local timezone to avoid date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getStartOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();
    // Convert Sunday (0) to 7 to make Monday (1) the first day
    const mondayDay = day === 0 ? 7 : day;
    const diff = result.getDate() - (mondayDay - 1); // Get Monday
    result.setDate(diff);
    return result;
  }

  setupDragAndDrop() {
    this.setupTaskDragging();
    this.setupCalendarDropZones();
  }

  setupTaskDragging() {
    // Make sidebar tasks draggable
    document.addEventListener("dragstart", (e) => {
      if (
        e.target.closest(".task-item") ||
        e.target.classList.contains("calendar-task")
      ) {
        e.target.classList.add("dragging");
        e.dataTransfer.setData("text/plain", e.target.dataset.taskId);
        e.dataTransfer.effectAllowed = "move";
      }
    });

    document.addEventListener("dragend", (e) => {
      if (
        e.target.closest(".task-item") ||
        e.target.classList.contains("calendar-task")
      ) {
        e.target.classList.remove("dragging");
        // Remove all drop zone indicators
        document
          .querySelectorAll(".drop-zone-active, .drop-zone-hover")
          .forEach((el) => {
            el.classList.remove("drop-zone-active", "drop-zone-hover");
          });
      }
    });
  }

  setupCalendarDropZones() {
    document.addEventListener("dragover", (e) => {
      const calendarDay = e.target.closest(".calendar-day");
      const sidebarContainer = e.target.closest("#tasks-without-date");

      if (calendarDay || sidebarContainer) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        if (calendarDay) {
          calendarDay.classList.add("drop-zone-hover");
        } else if (sidebarContainer) {
          sidebarContainer.classList.add("drop-zone-hover");
        }
      }
    });

    document.addEventListener("dragleave", (e) => {
      const calendarDay = e.target.closest(".calendar-day");
      const sidebarContainer = e.target.closest("#tasks-without-date");

      if (calendarDay) {
        calendarDay.classList.remove("drop-zone-hover");
      } else if (sidebarContainer) {
        sidebarContainer.classList.remove("drop-zone-hover");
      }
    });

    document.addEventListener("drop", (e) => {
      const calendarDay = e.target.closest(".calendar-day");
      const sidebarContainer = e.target.closest("#tasks-without-date");

      if (calendarDay || sidebarContainer) {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");

        if (calendarDay) {
          const targetDate = calendarDay.dataset.date;
          this.updateTaskDueDate(taskId, targetDate);
          calendarDay.classList.remove("drop-zone-hover");
        } else if (sidebarContainer) {
          this.updateTaskDueDate(taskId, null); // Remove due date
          sidebarContainer.classList.remove("drop-zone-hover");
        }
      }
    });
  }

  async updateTaskDueDate(taskId, dueDate) {
    try {
      let response;
      const payload = { due_date: dueDate };

      response = await makeApiRequest(
        `${APP_CONFIG.API_BASE_URL}/tasks/tasks/${taskId}`,
        "PATCH",
        payload,
      );
      if (response) {
        await showNotification(
          "Fecha de vencimiento actualizada exitosamente",
          "success",
        );
        // Reload the page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating task due date:", error);
      await showNotification(
        "Error al actualizar la fecha de vencimiento",
        "error",
      );
    }
  }

  setupTaskPlanningModal() {
    // Initialize the task planning modal functionality
    this.initializeTaskPlanningModal();
  }

  initializeTaskPlanningModal() {
    const config = {
      selectors: {
        planningPopup: "#task-planning-menu",
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
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ],
    };

    const state = { selectedDate: null, selectedPriority: null };

    const planningPopup = document.querySelector(
      config.selectors.planningPopup,
    );
    if (!planningPopup) return;

    const daysContainer = document.querySelector(
      config.selectors.daysContainer,
    );
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

    const showPopup = (taskId, event) => {
      taskIdInput.value = taskId;
      this.populateNextFourDays(config, daysContainer, state);
      this.resetPopup(
        config,
        state,
        daysContainer,
        prioritiesContainer,
        startTimeInput,
        endTimeInput,
        dateInput,
      );
      const rect = event.target.getBoundingClientRect();
      planningPopup.classList.add(config.classes.visible);
      planningPopup.style.top = `${rect.bottom + window.scrollY}px`;
      planningPopup.style.left = `${rect.left + window.scrollX}px`;

      // Adjust for scroll position
      const container = document.querySelector(".container-fluid");
      const containerRect = container.getBoundingClientRect();
      planningPopup.style.top = `${event.clientY - containerRect.top}px`;
      planningPopup.style.left = `${event.clientX - containerRect.left}px`;
    };

    const hidePopup = () => {
      planningPopup.classList.remove(config.classes.visible);
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
        let response;
        if (typeof makeApiRequest === "function") {
          response = await makeApiRequest(
            `${APP_CONFIG.API_BASE_URL}/tasks/task_planning/`,
            "POST",
            payload,
          );
        } else {
          // Fallback to direct fetch
          const fetchResponse = await fetch(`/api/tasks/task_planning/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          response = fetchResponse.ok ? await fetchResponse.json() : null;
        }

        if (response) {
          showNotification("¡Planificación guardada exitosamente!", "success");
          hidePopup();
        }
      } catch (error) {
        console.error("Error saving planning:", error);
        showNotification(`Error: ${error.message}`, "danger");
      }
    };

    // Store functions for external access
    this.showTaskPlanningPopup = showPopup;
    this.hideTaskPlanningPopup = hidePopup;

    // Event listeners
    cancelButtons.forEach((btn) => btn.addEventListener("click", hidePopup));
    saveButton.addEventListener("click", handleSave);

    if (prioritiesContainer) {
      prioritiesContainer
        .querySelectorAll(config.selectors.priorityButtons)
        .forEach((btn) => {
          btn.addEventListener("click", (e) =>
            this.handlePrioritySelection(e, config, state, prioritiesContainer),
          );
        });
    }

    // Close popup when clicking outside
    document.addEventListener("click", (e) => {
      if (
        planningPopup.classList.contains(config.classes.visible) &&
        !planningPopup.contains(e.target) &&
        !e.target.closest(".task-item") &&
        !e.target.closest(".calendar-task")
      ) {
        hidePopup();
      }
    });
  }

  populateNextFourDays(config, daysContainer, state) {
    daysContainer.innerHTML = "";
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("btn", "btn-outline-secondary", "btn-sm");
      button.dataset.date = date.toISOString().split("T")[0];
      // Convert getDay() to match our Monday-first dayNames array
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      let dayLabel = config.dayNames[dayIndex].substring(0, 3);
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
        const dateInput = document.querySelector(config.selectors.dateInput);
        const dateButton = document.querySelector(config.selectors.dateButton);
        if (dateInput) {
          dateInput.value = "";
        }
        if (dateButton) {
          dateButton.classList.remove(config.classes.active);
        }
      });
      daysContainer.appendChild(button);
    }
  }

  resetPopup(
    config,
    state,
    daysContainer,
    prioritiesContainer,
    startTimeInput,
    endTimeInput,
    dateInput,
  ) {
    state.selectedDate = null;
    state.selectedPriority = null;
    startTimeInput.value = "";
    endTimeInput.value = "";
    dateInput.value = "";
    const dateButton = document.querySelector(config.selectors.dateButton);
    if (dateButton) {
      dateButton.classList.remove(config.classes.active);
    }
    const activeDay = daysContainer.querySelector(`.${config.classes.active}`);
    if (activeDay) activeDay.classList.remove(config.classes.active);
    const activePriority = prioritiesContainer.querySelector(
      `.${config.classes.active}`,
    );
    if (activePriority) activePriority.classList.remove(config.classes.active);
  }

  handlePrioritySelection(e, config, state, prioritiesContainer) {
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
  }

  showTaskPlanningForTask(taskId, event) {
    if (this.showTaskPlanningPopup) {
      this.showTaskPlanningPopup(taskId, event);
    }
  }
}

// Global function for opening task planning from template
function showTaskPlanningPopup(event, taskElement) {
  const taskId = taskElement.dataset.taskId;
  if (
    window.pendingTasksCalendar &&
    window.pendingTasksCalendar.showTaskPlanningPopup
  ) {
    window.pendingTasksCalendar.showTaskPlanningPopup(taskId, event);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.pendingTasksCalendar = new PendingTasksCalendar();
});
