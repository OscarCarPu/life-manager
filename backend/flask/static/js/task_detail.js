// Utility helpers for task detail modal.
// We intentionally avoid redefining showTaskDetails here because the correct
// implementation lives in script.js and is used by both calendar and project_detail pages.

// Only define helpers if they are not already defined (calendar.js also defines them).
if (typeof formatDate === "undefined") {
  var formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    return `${day}/${month}/${year}, ${weekday}`;
  };
}

if (typeof formatStatus === "undefined") {
  var formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };
}

if (typeof getStatusCssClass === "undefined") {
  // Include bootstrap badge + custom state-badge + normalized status.
  var getStatusCssClass = (status) => {
    if (!status) return "badge state-badge";
    const normalizedStatus = status.toLowerCase();
    return `badge state-badge ${normalizedStatus}`;
  };
}

// Deprecated functions removed:
// - showTaskDetails (now in script.js)
// - updateTaskDetailModal (handled inside script.js showTaskDetails)
