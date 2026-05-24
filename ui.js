function showToast(message, type) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast toast-" + (type === "success" ? "success" : "error");
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 4000);
}

function showAlert(container, message, type) {
  if (!container) return;
  container.innerHTML =
    '<div class="alert alert-' +
    (type === "success" ? "success" : type === "warning" ? "warning" : "error") +
    '">' +
    message +
    "</div>";
}

function showAlertList(container, title, reasons) {
  if (!container) return;
  let html =
    '<div class="alert alert-error"><strong>' +
    escapeHtml(title) +
    "</strong><ul>";
  reasons.forEach(function (r) {
    html += "<li>" + escapeHtml(r) + "</li>";
  });
  html += "</ul></div>";
  container.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

function initModalClose(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return;

  overlay.querySelectorAll("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeModal(modalId);
    });
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal(modalId);
  });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

function statusLabel(status) {
  return status.replace(/_/g, " ");
}
