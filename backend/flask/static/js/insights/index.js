// Prepare data for charts
const insights = window.insightsData;
const jobInsights = insights.filter((i) => i.type === "job");
const dayInsights = insights.filter((i) => i.type === "day");

// Job chart
const jobLabels = jobInsights.map((i) => i.date).reverse();
const jobFocusData = jobInsights.map((i) => i.focus_score).reverse();
const jobProductivityData = jobInsights
  .map((i) => i.productivity_score)
  .reverse();
const jobSentimentData = jobInsights.map((i) => i.sentiment_score).reverse();
const jobGeneralData = jobInsights.map((i) => i.general_score).reverse();

const jobData = [
  {
    x: jobLabels,
    y: jobFocusData,
    type: "scatter",
    mode: "lines+markers",
    name: "Enfoque",
    line: { color: "blue" },
  },
  {
    x: jobLabels,
    y: jobProductivityData,
    type: "scatter",
    mode: "lines+markers",
    name: "Productividad",
    line: { color: "green" },
  },
  {
    x: jobLabels,
    y: jobSentimentData,
    type: "scatter",
    mode: "lines+markers",
    name: "Sentimiento",
    line: { color: "red" },
  },
  {
    x: jobLabels,
    y: jobGeneralData,
    type: "scatter",
    mode: "lines+markers",
    name: "General",
    line: { color: "orange" },
  },
];

const jobLayout = {
  title: "Puntuaciones de Trabajo",
  xaxis: { title: "Fecha" },
  yaxis: { title: "Puntuación", range: [0, 10] },
  responsive: true,
};

Plotly.newPlot("jobChart", jobData, jobLayout);

// Day chart
const dayLabels = dayInsights.map((i) => i.date).reverse();
const dayFocusData = dayInsights.map((i) => i.focus_score).reverse();
const dayProductivityData = dayInsights
  .map((i) => i.productivity_score)
  .reverse();
const daySentimentData = dayInsights.map((i) => i.sentiment_score).reverse();
const dayGeneralData = dayInsights.map((i) => i.general_score).reverse();

const dayData = [
  {
    x: dayLabels,
    y: dayFocusData,
    type: "scatter",
    mode: "lines+markers",
    name: "Enfoque",
    line: { color: "blue" },
  },
  {
    x: dayLabels,
    y: dayProductivityData,
    type: "scatter",
    mode: "lines+markers",
    name: "Productividad",
    line: { color: "green" },
  },
  {
    x: dayLabels,
    y: daySentimentData,
    type: "scatter",
    mode: "lines+markers",
    name: "Sentimiento",
    line: { color: "red" },
  },
  {
    x: dayLabels,
    y: dayGeneralData,
    type: "scatter",
    mode: "lines+markers",
    name: "General",
    line: { color: "orange" },
  },
];

const dayLayout = {
  title: "Puntuaciones del Día",
  xaxis: { title: "Fecha" },
  yaxis: { title: "Puntuación", range: [0, 10] },
  responsive: true,
};

Plotly.newPlot("dayChart", dayData, dayLayout);

function showText(date, type) {
  // Find the insight in the loaded data
  const insight = window.insightsData.find(
    (i) => i.date === date && i.type === type,
  );
  if (insight) {
    document.getElementById("insightText").textContent = insight.text;
    new bootstrap.Modal(document.getElementById("textModal")).show();
  } else {
    document.getElementById("insightText").textContent = "Texto no encontrado.";
    new bootstrap.Modal(document.getElementById("textModal")).show();
  }
}
