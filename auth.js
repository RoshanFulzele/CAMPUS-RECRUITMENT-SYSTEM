function getDashboardPath(role) {
  if (role === "company") return "company.html";
  if (role === "tpo") return "tpo.html";
  return "student.html";
}

function requireAuth(allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.user_role)) {
    const params = new URLSearchParams();
    params.set("error", "unauthorized");
    window.location.href = getDashboardPath(user.user_role) + "?" + params.toString();
    return null;
  }
  return user;
}

function redirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    window.location.href = getDashboardPath(user.user_role);
  }
}

function showUnauthorizedBanner() {
  const params = new URLSearchParams(window.location.search);
  const banner = document.getElementById("unauthorized-banner");
  if (banner && params.get("error") === "unauthorized") {
    banner.classList.remove("hidden");
  }
}

function initSidebar(user, activePage) {
  document.getElementById("user-name").textContent = user.full_name;
  document.getElementById("user-email").textContent = user.email;

  const roleLabels = {
    student: "Student",
    company: "Company",
    tpo: "TPO Admin",
  };
  const roleEl = document.getElementById("user-role-label");
  if (roleEl) roleEl.textContent = roleLabels[user.user_role] || user.user_role;

  document.querySelectorAll(".sidebar-nav a").forEach((link) => {
    if (link.dataset.page === activePage) {
      link.classList.add("active");
    }
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logoutUser();
      window.location.href = "login.html";
    });
  }
}
