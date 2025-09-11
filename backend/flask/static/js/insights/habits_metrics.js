(function () {
  const API = APP_CONFIG.API_BASE_URL + "/insights";
  const habitsList = document.getElementById("habits-list");
  const metricsList = document.getElementById("metrics-list");
  const chartDiv = document.getElementById("chart");
  const detailTitle = document.getElementById("detail-title");
  const detailActions = document.getElementById("detail-actions");
  // History removed: only chart and entry form
  const entryFormContainer = document.getElementById("entry-form-container");
  const entryForm = document.getElementById("entry-form");
  const entryFormTitle = document.getElementById("entry-form-title");
  const btnCancelEntry = document.getElementById("btn-cancel-entry");
  const fieldScore = document.getElementById("field-score");
  const fieldCompleted = document.getElementById("field-completed");
  const fieldValue = document.getElementById("field-value");
  const valueUnit = document.getElementById("value-unit");

  const btnAddHabit = document.getElementById("btn-add-habit");
  const btnAddMetric = document.getElementById("btn-add-metric");
  const btnEditSelected = document.getElementById("btn-edit-selected");
  const btnDeleteSelected = document.getElementById("btn-delete-selected");

  const habitModal = new bootstrap.Modal(document.getElementById("habitModal"));
  const habitForm = document.getElementById("habit-form");
  const habitModalLabel = document.getElementById("habitModalLabel");
  const habitSaveBtn = document.getElementById("habit-modal-save");

  const metricModal = new bootstrap.Modal(
    document.getElementById("metricModal"),
  );
  const metricForm = document.getElementById("metric-form");
  const metricModalLabel = document.getElementById("metricModalLabel");
  const metricSaveBtn = document.getElementById("metric-modal-save");

  let selected = { type: null, id: null, meta: {} };

  function renderList(container, items, type) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
      const div = document.createElement("div");
      div.className = "p-3 text-muted";
      div.textContent =
        type === "habit" ? "No hay hábitos." : "No hay métricas.";
      container.appendChild(div);
      return;
    }
    for (const item of items) {
      const a = document.createElement("a");
      a.href = "#";
      a.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center ${type}-item`;
      a.dataset.id = item.id;
      if (type === "habit") a.dataset.type = item.type;
      if (type === "metric") a.dataset.unit = item.unit || "";

      const left = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = item.name;
      left.appendChild(strong);
      if (item.description) {
        left.appendChild(document.createElement("br"));
        const small = document.createElement("small");
        small.className = "text-muted";
        small.textContent = item.description;
        left.appendChild(small);
      }

      const right = document.createElement("span");
      if (type === "habit") {
        right.className = "badge bg-secondary text-uppercase";
        right.textContent = item.type;
      } else if (type === "metric" && item.unit) {
        right.className = "badge bg-secondary";
        right.textContent = item.unit;
      }

      a.appendChild(left);
      a.appendChild(right);
      container.appendChild(a);
    }
  }

  function resetDetail() {
    selected = { type: null, id: null, meta: {} };
    detailTitle.textContent = "Detalle";
    detailActions.style.display = "none";
    entryFormContainer.style.display = "none";
    Plotly.purge(chartDiv);
  }

  function selectHabit(el) {
    habitsList
      .querySelectorAll(".habit-item")
      .forEach((i) => i.classList.remove("active"));
    metricsList
      .querySelectorAll(".metric-item")
      .forEach((i) => i.classList.remove("active"));
    el.classList.add("active");
    const id = parseInt(el.dataset.id, 10);
    const type = el.dataset.type; // score | boolean
    selected = { type: "habit", id, meta: { habitType: type } };
    detailTitle.textContent = `Hábito: ${el.querySelector("strong").textContent}`;
    detailActions.style.display = "inline-flex";
    entryFormContainer.style.display = "block";
    // set today's date
    entryForm.elements["date"].value = new Date().toISOString().slice(0, 10);

    // Toggle fields
    fieldScore.style.display = type === "score" ? "block" : "none";
    fieldCompleted.style.display = type === "boolean" ? "block" : "none";
    fieldValue.style.display = "none";
    valueUnit.textContent = "";
    // required flags
    if (entryForm.elements["value"])
      entryForm.elements["value"].required = false;

    // Load history via API and plot
    loadHabitEntries(id, type);
  }

  function selectMetric(el) {
    habitsList
      .querySelectorAll(".habit-item")
      .forEach((i) => i.classList.remove("active"));
    metricsList
      .querySelectorAll(".metric-item")
      .forEach((i) => i.classList.remove("active"));
    el.classList.add("active");
    const id = parseInt(el.dataset.id, 10);
    const unit = el.dataset.unit || "";
    selected = { type: "metric", id, meta: { unit } };
    detailTitle.textContent = `Métrica: ${el.querySelector("strong").textContent}`;
    detailActions.style.display = "inline-flex";
    entryFormContainer.style.display = "block";
    // set today's date
    entryForm.elements["date"].value = new Date().toISOString().slice(0, 10);

    // Toggle fields
    fieldScore.style.display = "none";
    fieldCompleted.style.display = "none";
    fieldValue.style.display = "block";
    valueUnit.textContent = unit ? `(${unit})` : "";
    // required flags
    if (entryForm.elements["value"])
      entryForm.elements["value"].required = true;

    loadMetricEntries(id, unit);
  }

  async function loadHabitEntries(habitId, habitType) {
    try {
      const data = await makeApiRequest(
        `${API}/habits/${habitId}/entries`,
        "GET",
      );
      renderHabitChart(data, habitType);
    } catch {}
  }

  async function loadMetricEntries(metricId, unit) {
    try {
      const data = await makeApiRequest(
        `${API}/metrics/${metricId}/entries`,
        "GET",
      );
      renderMetricChart(data, unit);
    } catch {}
  }

  function renderHabitChart(entries, habitType) {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    const sliced = sorted.slice(Math.max(0, sorted.length - 50));
    const x = sliced.map((e) => e.date);
    let traces = [];
    if (habitType === "score") {
      const y = sliced.map((e) => e.score ?? null);
      traces.push({
        x,
        y,
        type: "scatter",
        mode: "lines+markers",
        name: "Puntuación",
        line: { color: "#0d6efd" },
      });
      const layout = {
        margin: { t: 10, r: 10, b: 30, l: 35 },
        yaxis: { title: "Puntuación", range: [0, 10] },
        xaxis: { title: "Fecha" },
      };
      Plotly.newPlot(chartDiv, traces, layout, { responsive: true });
    } else {
      // Boolean: show completion markers + 15-day moving average line
      const yBool = sliced.map((e) => (e.completed ? 1 : 0));
      const avg15 = movingAverage(yBool, 15);
      traces.push({
        x,
        y: avg15,
        type: "scatter",
        mode: "lines",
        name: "Media 15d",
        line: { color: "#198754" },
      });
      const completedDates = sliced
        .filter((e) => e.completed)
        .map((e) => e.date);
      if (completedDates.length) {
        traces.push({
          x: completedDates,
          y: new Array(completedDates.length).fill(1),
          type: "scatter",
          mode: "markers",
          name: "Completado",
          marker: { color: "#6c757d", size: 6, symbol: "circle" },
        });
      }
      const layout = {
        margin: { t: 10, r: 10, b: 30, l: 35 },
        yaxis: {
          title: "Completado",
          range: [-0.05, 1.05],
          tickmode: "array",
          tickvals: [0, 1],
          ticktext: ["No", "Sí"],
        },
        xaxis: { title: "Fecha" },
      };
      Plotly.newPlot(chartDiv, traces, layout, { responsive: true });
    }
  }

  function renderMetricChart(entries, unit) {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    const sliced = sorted.slice(Math.max(0, sorted.length - 50));
    const x = sliced.map((e) => e.date);
    const y = sliced.map((e) => Number(e.value));
    let traces = [];
    traces.push({
      x,
      y,
      type: "scatter",
      mode: "lines+markers",
      name: unit || "Valor",
      line: { color: "#fd7e14" },
    });
    // Media móvil de 15 días para métricas
    if (y.length > 0) {
      const avg15 = movingAverage(y, 15);
      traces.push({
        x,
        y: avg15,
        type: "scatter",
        mode: "lines",
        name: "Media 15d",
        line: { color: "#198754", dash: "dot" },
      });
    }
    const layout = {
      margin: { t: 10, r: 10, b: 30, l: 35 },
      yaxis: { title: unit || "Valor" },
      xaxis: { title: "Fecha" },
    };
    Plotly.newPlot(chartDiv, traces, layout, { responsive: true });
  }

  // Utils: moving average and linear regression
  function movingAverage(values, windowSize) {
    const result = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= windowSize) {
        sum -= values[i - windowSize];
        result.push(sum / windowSize);
      } else {
        // average of first i+1 items (progressive)
        result.push(sum / (i + 1));
      }
    }
    return result;
  }

  // linear regression removed (no longer used)

  // History table removed

  // Entry create/update/delete
  let editingEntryId = null;

  function startEditEntry(kind, entryId) {
    editingEntryId = entryId;
    entryFormTitle.textContent = "Editar registro";
    btnCancelEntry.style.display = "inline-block";
    // Refetch list and prefill, since no history table
    if (selected.type === "habit") {
      makeApiRequest(`${API}/habits/${selected.id}/entries`, "GET").then(
        (list) => {
          const e = list.find((x) => x.id === entryId);
          fillEntryFormFrom(e, "habit");
        },
      );
    } else if (selected.type === "metric") {
      makeApiRequest(`${API}/metrics/${selected.id}/entries`, "GET").then(
        (list) => {
          const e = list.find((x) => x.id === entryId);
          fillEntryFormFrom(e, "metric");
        },
      );
    }
  }

  function fillEntryFormFrom(e, kind) {
    if (!e) return;
    entryForm.elements["date"].value = e.date;
    if (kind === "habit") {
      if (selected.meta.habitType === "score")
        entryForm.elements["score"].value = e.score ?? "";
      else
        entryForm.elements["completed"].value = e.completed ? "true" : "false";
    } else {
      entryForm.elements["value"].value = e.value;
    }
  }

  async function deleteEntry(kind, entryId) {
    if (!confirm("¿Eliminar registro?")) return;
    try {
      if (kind === "habit") {
        await makeApiRequest(
          `${API}/habits/${selected.id}/entries/${entryId}`,
          "DELETE",
        );
        showNotification("Registro eliminado", "success");
        loadHabitEntries(selected.id, selected.meta.habitType);
      } else {
        await makeApiRequest(
          `${API}/metrics/${selected.id}/entries/${entryId}`,
          "DELETE",
        );
        showNotification("Registro eliminado", "success");
        loadMetricEntries(selected.id, selected.meta.unit);
      }
    } catch {}
  }

  entryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selected.type) return;
    const form = new FormData(entryForm);
    const payload = { date: form.get("date") };
    try {
      if (selected.type === "habit") {
        if (selected.meta.habitType === "score")
          payload.score = form.get("score")
            ? parseInt(form.get("score"), 10)
            : null;
        else payload.completed = form.get("completed") === "true";
        if (editingEntryId) {
          await makeApiRequest(
            `${API}/habits/${selected.id}/entries/${editingEntryId}`,
            "PUT",
            payload,
          );
        } else {
          await makeApiRequest(
            `${API}/habits/${selected.id}/entries`,
            "POST",
            payload,
          );
        }
        showNotification("Registro guardado", "success");
        loadHabitEntries(selected.id, selected.meta.habitType);
      } else {
        payload.value = form.get("value") ? Number(form.get("value")) : null;
        if (editingEntryId) {
          await makeApiRequest(
            `${API}/metrics/${selected.id}/entries/${editingEntryId}`,
            "PUT",
            payload,
          );
        } else {
          await makeApiRequest(
            `${API}/metrics/${selected.id}/entries`,
            "POST",
            payload,
          );
        }
        showNotification("Registro guardado", "success");
        loadMetricEntries(selected.id, selected.meta.unit);
      }
      entryForm.reset();
      entryFormTitle.textContent = "Nuevo registro";
      btnCancelEntry.style.display = "none";
      editingEntryId = null;
    } catch {}
  });

  btnCancelEntry.addEventListener("click", () => {
    editingEntryId = null;
    entryForm.reset();
    entryFormTitle.textContent = "Nuevo registro";
    btnCancelEntry.style.display = "none";
  });

  // Habit create/edit/delete
  btnAddHabit.addEventListener("click", () => {
    habitForm.reset();
    habitForm.elements["id"].value = "";
    habitModalLabel.textContent = "Nuevo hábito";
    habitModal.show();
  });
  habitSaveBtn.addEventListener("click", async () => {
    const form = new FormData(habitForm);
    const id = form.get("id");
    const payload = {
      name: form.get("name"),
      description: form.get("description") || null,
      type: form.get("type"),
    };
    try {
      if (id) {
        await makeApiRequest(`${API}/habits/${id}`, "PUT", payload);
        showNotification("Hábito actualizado", "success");
      } else {
        await makeApiRequest(`${API}/habits/`, "POST", payload);
        showNotification("Hábito creado", "success");
      }
      habitModal.hide();
      // reload list
      const updated = await makeApiRequest(`${API}/habits/`, "GET");
      renderList(habitsList, updated, "habit");
      attachListHandlers();
    } catch {}
  });

  btnEditSelected.addEventListener("click", async () => {
    if (!selected.type) return;
    if (selected.type === "habit") {
      const h = await makeApiRequest(`${API}/habits/${selected.id}`, "GET");
      habitForm.elements["id"].value = h.id;
      habitForm.elements["name"].value = h.name || "";
      habitForm.elements["description"].value = h.description || "";
      habitForm.elements["type"].value = h.type;
      habitModalLabel.textContent = "Editar hábito";
      habitModal.show();
    } else {
      const m = await makeApiRequest(`${API}/metrics/${selected.id}`, "GET");
      metricForm.elements["id"].value = m.id;
      metricForm.elements["name"].value = m.name || "";
      metricForm.elements["description"].value = m.description || "";
      metricForm.elements["unit"].value = m.unit || "";
      metricModalLabel.textContent = "Editar métrica";
      metricModal.show();
    }
  });

  btnDeleteSelected.addEventListener("click", async () => {
    if (!selected.type) return;
    if (!confirm("¿Eliminar elemento seleccionado?")) return;
    try {
      if (selected.type === "habit") {
        await makeApiRequest(`${API}/habits/${selected.id}`, "DELETE");
        showNotification("Hábito eliminado", "success");
        const updated = await makeApiRequest(`${API}/habits/`, "GET");
        renderList(habitsList, updated, "habit");
        attachListHandlers();
      } else {
        await makeApiRequest(`${API}/metrics/${selected.id}`, "DELETE");
        showNotification("Métrica eliminada", "success");
        const updated = await makeApiRequest(`${API}/metrics/`, "GET");
        renderList(metricsList, updated, "metric");
        attachListHandlers();
      }
      resetDetail();
    } catch {}
  });

  // Metric create/edit
  btnAddMetric.addEventListener("click", () => {
    metricForm.reset();
    metricForm.elements["id"].value = "";
    metricModalLabel.textContent = "Nueva métrica";
    metricModal.show();
  });
  metricSaveBtn.addEventListener("click", async () => {
    const form = new FormData(metricForm);
    const id = form.get("id");
    const payload = {
      name: form.get("name"),
      description: form.get("description") || null,
      unit: form.get("unit") || null,
    };
    try {
      if (id) {
        await makeApiRequest(`${API}/metrics/${id}`, "PUT", payload);
        showNotification("Métrica actualizada", "success");
      } else {
        await makeApiRequest(`${API}/metrics/`, "POST", payload);
        showNotification("Métrica creada", "success");
      }
      metricModal.hide();
      const updated = await makeApiRequest(`${API}/metrics/`, "GET");
      renderList(metricsList, updated, "metric");
      attachListHandlers();
    } catch {}
  });

  function attachListHandlers() {
    habitsList.querySelectorAll(".habit-item").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        selectHabit(el);
      });
    });
    metricsList.querySelectorAll(".metric-item").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        selectMetric(el);
      });
    });
  }

  // Initial render and setup
  renderList(habitsList, window.initialHabits || [], "habit");
  renderList(metricsList, window.initialMetrics || [], "metric");
  attachListHandlers();
  resetDetail();
})();
