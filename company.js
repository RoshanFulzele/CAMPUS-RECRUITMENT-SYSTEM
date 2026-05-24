seedDemoData();
const user = requireAuth(["company"]);
if (!user) throw new Error("redirect");

showUnauthorizedBanner();
initSidebar(user, "overview");

const meta = user.company_meta || getCompanyMeta(user.id);
document.getElementById("user-initials").textContent = meta.initials;
document.getElementById("company-title").textContent = user.full_name;
const orb = document.getElementById("company-orb");
if (orb) orb.style.background = "linear-gradient(135deg," + meta.color + "," + meta.color + "99)";

let jobFormStep = 1;

function renderDashboard() {
  const jobs = getJobsByCompany(user.id);
  const applications = getApplicationsForCompany(user.id);
  const db = loadDb();

  const interviewing = applications.filter(function (a) {
    return a.status === "interviewing" || a.status === "test_shortlist";
  }).length;
  const hired = applications.filter(function (a) {
    return a.status === "selected";
  }).length;

  document.getElementById("stats-grid").innerHTML =
    '<div class="stat-pill glass"><label>Applicants</label><div class="value">' +
    applications.length +
    '</div></div><div class="stat-pill glass"><label>In pipeline</label><div class="value">' +
    interviewing +
    '</div></div><div class="stat-pill glass"><label>Hired</label><div class="value">' +
    hired +
    '</div></div><div class="stat-pill glass"><label>Open roles</label><div class="value">' +
    jobs.filter(function (j) {
      return j.status === "open";
    }).length +
    "</div></div>";

  document.getElementById("jobs-summary").textContent =
    jobs.length + " total postings at " + user.full_name;

  const grid = document.getElementById("jobs-grid");
  const empty = document.getElementById("jobs-empty");

  if (jobs.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    grid.innerHTML = jobs
      .map(function (job) {
        const count = applications.filter(function (a) {
          return a.job_id === job.id;
        }).length;
        return (
          '<article class="job-card-premium glass"><h3>' +
          escapeHtml(job.title) +
          '</h3><div class="job-tags" style="margin-top:0.75rem"><span class="tag">' +
          (job.job_type === "fulltime" ? "Full-time" : "Internship") +
          '</span><span class="tag">' +
          escapeHtml(job.location) +
          '</span><span class="tag">' +
          count +
          ' applicants</span></div><p class="job-desc" style="margin-top:0.75rem">' +
          escapeHtml(job.description) +
          '</p><p class="job-ctc" style="margin-top:1rem">' +
          escapeHtml(job.ctc) +
          "</p></article>"
        );
      })
      .join("");
  }

  renderApplicants(applications, db);
}

function renderApplicants(applications, db) {
  const list = document.getElementById("applicants-list");
  const empty = document.getElementById("applicants-empty");
  const statusOptions = [
    "applied",
    "test_shortlist",
    "interviewing",
    "selected",
    "rejected",
  ];

  if (applications.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.innerHTML = applications
    .map(function (app) {
      const student = db.users.find(function (u) {
        return u.id === app.student_id;
      });
      const job = getJobById(app.job_id);
      const form = app.form_data || {};
      const acad = form.academic || {};
      const skills = form.skills || {};
      const stmt = form.statement || {};

      let selectHtml =
        '<select class="status-select" data-app-id="' + app.id + '">';
      statusOptions.forEach(function (opt) {
        selectHtml +=
          '<option value="' +
          opt +
          '"' +
          (app.status === opt ? " selected" : "") +
          ">" +
          statusLabel(opt) +
          "</option>";
      });
      selectHtml += "</select>";

      return (
        '<div class="job-card-premium glass" style="margin-bottom:1rem"><div class="job-card-top"><div class="user-avatar" style="width:48px;height:48px;border-radius:14px">' +
        (student ? student.full_name.charAt(0) : "?") +
        '</div><div style="flex:1"><h3>' +
        escapeHtml(student ? student.full_name : "—") +
        '</h3><p class="company-name">' +
        escapeHtml(job ? job.title : "—") +
        " · " +
        escapeHtml(student ? student.email : "") +
        '</p></div>' +
        selectHtml +
        "</div>" +
        (form.academic
          ? '<div class="application-detail-card"><strong>Academic:</strong> ' +
            escapeHtml(acad.university || "") +
            " · " +
            escapeHtml(acad.branch || "") +
            " · CGPA " +
            (acad.cgpa ?? "—") +
            " · " +
            (acad.backlogs ?? 0) +
            " backlogs<br><strong>Skills:</strong> " +
            escapeHtml(skills.technical || "—") +
            "<br><strong>Why us:</strong> " +
            escapeHtml((stmt.why_company || "").slice(0, 200)) +
            (stmt.why_company && stmt.why_company.length > 200 ? "…" : "") +
            "</div>"
          : '<div class="application-detail-card text-muted">Legacy application (no extended form)</div>') +
        "</div>"
      );
    })
    .join("");

  list.querySelectorAll(".status-select").forEach(function (sel) {
    sel.addEventListener("change", function () {
      const result = updateApplicationStatus(sel.dataset.appId, sel.value, user.id);
      if (result.error) {
        showToast(result.error, "error");
        renderDashboard();
        return;
      }
      showToast("Status → " + statusLabel(sel.value), "success");
      renderDashboard();
    });
  });
}

function resetJobModal() {
  jobFormStep = 1;
  document.getElementById("job-title").value = "";
  document.getElementById("job-description").value = "";
  document.getElementById("job-ctc").value = "";
  document.getElementById("job-step-panel-1").classList.remove("hidden");
  document.getElementById("job-step-panel-2").classList.add("hidden");
  document.getElementById("job-back-btn").classList.add("hidden");
  document.getElementById("job-next-btn").textContent = "Continue →";
  document.getElementById("job-alert").innerHTML = "";
}

document.getElementById("open-job-modal").addEventListener("click", function () {
  resetJobModal();
  openModal("job-modal");
});

document.getElementById("job-next-btn").addEventListener("click", function () {
  const alertBox = document.getElementById("job-alert");
  alertBox.innerHTML = "";

  if (jobFormStep === 1) {
    if (
      !document.getElementById("job-title").value.trim() ||
      document.getElementById("job-description").value.trim().length < 20
    ) {
      showAlert(alertBox, "Title and description (20+ chars) required.", "error");
      return;
    }
    document.getElementById("job-step-panel-1").classList.add("hidden");
    document.getElementById("job-step-panel-2").classList.remove("hidden");
    document.getElementById("job-back-btn").classList.remove("hidden");
    document.getElementById("job-next-btn").textContent = "Publish";
    jobFormStep = 2;
  } else {
    const branchesRaw = document.getElementById("job-branches").value.trim();
    const allowed_branches =
      branchesRaw.toUpperCase() === "ALL"
        ? []
        : branchesRaw.split(",").map(function (b) {
            return b.trim();
          }).filter(Boolean);

    createJob(user.id, {
      title: document.getElementById("job-title").value.trim(),
      description: document.getElementById("job-description").value.trim(),
      ctc: document.getElementById("job-ctc").value.trim(),
      min_cgpa: document.getElementById("job-min-cgpa").value,
      max_backlogs: document.getElementById("job-max-backlogs").value,
      allowed_branches: allowed_branches.length ? allowed_branches : ["CSE"],
      job_type: document.getElementById("job-type").value,
      duration: document.getElementById("job-duration").value,
      mode: document.getElementById("job-mode").value,
      location: document.getElementById("job-location").value,
    });

    closeModal("job-modal");
    showToast("Role published!", "success");
    renderDashboard();
  }
});

document.getElementById("job-back-btn").addEventListener("click", function () {
  jobFormStep = 1;
  document.getElementById("job-step-panel-2").classList.add("hidden");
  document.getElementById("job-step-panel-1").classList.remove("hidden");
  document.getElementById("job-back-btn").classList.add("hidden");
  document.getElementById("job-next-btn").textContent = "Continue →";
});

initModalClose("job-modal");
renderDashboard();
