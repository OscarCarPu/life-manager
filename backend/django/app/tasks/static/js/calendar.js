// Minimal calendar functionality
document.addEventListener("DOMContentLoaded", function () {
  console.log("Calendar loaded");

  // Listen for HTMX events for debugging
  document.body.addEventListener("htmx:beforeRequest", function (evt) {
    console.log("HTMX request starting:", evt.detail.xhr.responseURL);
  });

  document.body.addEventListener("htmx:afterRequest", function (evt) {
    console.log("HTMX request completed:", evt.detail.xhr.status);
  });

  document.body.addEventListener("htmx:responseError", function (evt) {
    console.error("HTMX error:", evt.detail);
  });
});
