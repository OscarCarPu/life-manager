// Shared utility functions (loaded before other scripts)
// Date formatting: returns DD/MM/YYYY, Weekday
function formatDate(dateString) {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${day}/${month}/${year}, ${weekday}`;
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

// If isProject is true we keep same class logic (can extend later)
function getStatusCssClass(status, isProject = false) {
  if (!status) return "badge state-badge";
  const normalizedStatus = status.toLowerCase();
  // Allow different base class for project if needed in future
  const base = isProject ? "badge state-badge" : "badge state-badge";
  return `${base} ${normalizedStatus}`;
}

// Expose to global (defensive for module loaders)
window.formatDate = formatDate;
window.formatStatus = formatStatus;
window.getStatusCssClass = getStatusCssClass;
