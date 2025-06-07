document.addEventListener("DOMContentLoaded", function () {
  // Load HTMX dynamically if not already loaded
  if (typeof htmx === "undefined") {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/htmx.org@2.0.4";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  // htmx:afterSwap listener for modal content
  document.body.addEventListener("htmx:afterSwap", function (event) {
    const modalElement = document.getElementById("htmxModal");
    if (modalElement && event.detail.target.id === "htmxModalBody") {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  });

  // htmx:afterRequest listener for modal close
  document.body.addEventListener("htmx:afterRequest", function (event) {
    if (event.detail.xhr.status >= 200 && event.detail.xhr.status < 300) {
      // Verify if the request was for a modal close
      const formInModal = event.detail.elt.closest(".modal-body");
      if (formInModal) {
        const modalElement = document.getElementById("htmxModal");
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
            modalElement.innerHTML = "";
          }
        }
      }
    }
  });

  // CSRF token helper
  window.getCookie = function (name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
});
