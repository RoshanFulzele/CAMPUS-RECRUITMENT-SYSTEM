seedDemoData();
const user = requireAuth(["student"]);
if (!user) throw new Error("redirect");

showUnauthorizedBanner();
initSidebar(user, "overview");

const initials = user.full_name
  .split(" ")
  .map(function (n) {
    return n[0];
  })
  .join("")
  .slice(0, 2)
  .toUpperCase();
document.getElementById("user-initials").textContent = initials;
document.getElementById("greeting").textContent =
  "Hello, " + user.full_name.split(" ")[0];

let activeFilter = "all";

function onApplicationSubmitted() {
  renderDashboard();
}

function renderFilters(jobs) {
  const companies = {};
  jobs.forEach(function (j) {
    companies[j.company_id] = getCompanyName(j.company_id);
  });
  const bar = document.getElementById("filters-bar");
  let html =
    '<button type="button" class="filter-chip' +
    (activeFilter === "all" ? " active" : "") +
    '" data-filter="all">All (' +
    jobs.length +
    ")</button>";
  html +=
    '<button type="button" class="filter-chip' +
    (activeFilter === "internship" ? " active" : "") +
    '" data-filter="internship">Internships</button>';
  html +=
    '<button type="button" class="filter-chip' +
    (activeFilter === "fulltime" ? " active" : "") +
    '" data-filter="fulltime">Full-time</button>';
  html +=
    '<button type="button" class="filter-chip' +
    (activeFilter === "remote" ? " active" : "") +
    '" data-filter="remote">Remote-friendly</button>';

  Object.keys(companies)
    .slice(0, 6)
    .forEach(function (cid) {
      html +=
        '<button type="button" class="filter-chip' +
        (activeFilter === cid ? " active" : "") +
        '" data-filter="' +
        cid +
        '">' +
        escapeHtml(companies[cid].split(" ")[0]) +
        "</button>";
    });

  bar.innerHTML = html;
  bar.querySelectorAll(".filter-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeFilter = chip.dataset.filter;
      renderDashboard();
    });
  });
}

function filterJobs(jobs) {
  if (activeFilter === "all") return jobs;
  if (activeFilter === "internship")
    return jobs.filter(function (j) {
      return j.job_type !== "fulltime";
    });
  if (activeFilter === "fulltime")
    return jobs.filter(function (j) {
      return j.job_type === "fulltime";
    });
  if (activeFilter === "remote")
    return jobs.filter(function (j) {
      return j.mode === "remote" || j.mode === "hybrid";
    });
  return jobs.filter(function (j) {
    return j.company_id === activeFilter;
  });
}

function renderDashboard() {
  const details = getStudentDetails(user.id);
  const allJobs = getOpenJobs();
  const jobs = filterJobs(allJobs);
  const applications = getApplicationsByStudent(user.id);

  document.getElementById("stats-grid").innerHTML =
    '<div class="stat-pill glass"><label>CGPA</label><div class="value">' +
    (details ? Number(details.cgpa).toFixed(2) : "—") +
    '</div></div><div class="stat-pill glass"><label>Active Apps</label><div class="value">' +
    applications.length +
    '</div></div><div class="stat-pill glass"><label>Open Roles</label><div class="value">' +
    allJobs.length +
    '</div></div><div class="stat-pill glass"><label>Companies</label><div class="value">' +
    getAllCompanies().length +
    "</div></div>";

  document.getElementById("drives-count").textContent =
    jobs.length + " opportunities · " + getAllCompanies().length + " hiring partners";

  renderFilters(allJobs);

  const grid = document.getElementById("drives-grid");
  const empty = document.getElementById("drives-empty");

  if (jobs.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    grid.innerHTML = jobs
      .map(function (job, index) {
        const meta = getCompanyMeta(job.company_id);
        const companyName = getCompanyName(job.company_id);
        const badge = details
          ? previewEligibility(
              {
                branch: details.branch,
                cgpa: Number(details.cgpa),
                backlogs: details.backlogs,
              },
              job
            ) === "eligible"
            ? '<span class="badge badge-eligible">Eligible</span>'
            : '<span class="badge badge-warning">Check criteria</span>'
          : '<span class="badge badge-warning">Complete profile</span>';
        const applied = hasApplied(user.id, job.id);

        return (
          '<article class="job-card-premium glass" style="animation-delay:' +
          index * 0.04 +
          's"><div class="job-card-top"><div class="company-logo" style="background:' +
          meta.color +
          '">' +
          meta.initials +
          '</div><div style="flex:1"><h3>' +
          escapeHtml(job.title) +
          '</h3><p class="company-name">' +
          escapeHtml(companyName) +
          " · " +
          escapeHtml(meta.sector) +
          "</p></div>" +
          badge +
          '</div><div class="job-tags"><span class="tag">' +
          (job.job_type === "fulltime" ? "Full-time" : "Internship") +
          '</span><span class="tag">' +
          escapeHtml(job.duration) +
          '</span><span class="tag">' +
          escapeHtml(job.mode) +
          '</span><span class="tag">📍 ' +
          escapeHtml(job.location) +
          '</span></div><p class="job-desc">' +
          escapeHtml(job.description) +
          '</p><div class="job-footer"><span class="job-ctc">' +
          escapeHtml(job.ctc) +
          "</span>" +
          (applied
            ? '<button class="btn btn-glass btn-sm" disabled>Applied ✓</button>'
            : '<button class="btn btn-primary btn-sm" data-apply="' +
              job.id +
              '">Apply →</button>') +
          "</div></article>"
        );
      })
      .join("");

    grid.querySelectorAll("[data-apply]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const job = getJobById(btn.dataset.apply);
        if (job) openInternshipApplicationForm(job, user);
      });
    });
  }

  renderApplications(applications);
}

function statusBadgeClass(status) {
  if (status === "selected") return "badge-status-selected";
  if (status === "rejected") return "badge-status-rejected";
  if (status === "interviewing" || status === "test_shortlist")
    return "badge-status-interviewing";
  return "badge-status-applied";
}

function renderApplications(applications) {
  const list = document.getElementById("applications-list");
  const empty = document.getElementById("applications-empty");

  if (applications.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  list.innerHTML = applications
    .map(function (app) {
      const job = getJobById(app.job_id);
      if (!job) return "";
      const meta = getCompanyMeta(job.company_id);
      const companyName = getCompanyName(job.company_id);
      const form = app.form_data || {};

      return (
        '<div class="job-card-premium glass" style="margin-bottom:1rem"><div class="job-card-top"><div class="company-logo" style="background:' +
        meta.color +
        '">' +
        meta.initials +
        '</div><div style="flex:1"><h3>' +
        escapeHtml(job.title) +
        '</h3><p class="company-name">' +
        escapeHtml(companyName) +
        '</p></div><span class="badge ' +
        statusBadgeClass(app.status) +
        '">' +
        statusLabel(app.status) +
        '</span></div><div class="job-tags"><span class="tag">Applied ' +
        formatDate(app.created_at) +
        '</span><span class="tag">' +
        escapeHtml(job.ctc) +
        "</span></div>" +
        (form.academic
          ? '<div class="application-detail-card"><strong>Submitted profile:</strong> ' +
            escapeHtml(form.academic.branch) +
            " · CGPA " +
            form.academic.cgpa +
            " · " +
            escapeHtml(form.preferences?.mode || job.mode) +
            "</div>"
          : "") +
        "</div>"
      );
    })
    .join("");
}

initApplicationWizard();
renderDashboard();
