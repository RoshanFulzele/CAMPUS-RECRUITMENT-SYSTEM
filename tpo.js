seedDemoData();
const user = requireAuth(["tpo"]);
if (!user) throw new Error("redirect");

initSidebar(user, "overview");
document.getElementById("user-initials").textContent = "RK";

function parseCtc(ctc) {
  const match = (ctc || "").match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function renderDashboard() {
  const db = loadDb();
  const jobs = getAllJobs();
  const applications = getAllApplications();
  const companies = getAllCompanies();
  const totalStudents = getStudentCount();
  const selected = applications.filter(function (a) {
    return a.status === "selected";
  });
  const openDrives = jobs.filter(function (j) {
    return j.status === "open";
  }).length;

  const placementRate =
    totalStudents > 0 ? Math.round((selected.length / totalStudents) * 100) : 0;

  const ctcValues = selected
    .map(function (a) {
      const job = getJobById(a.job_id);
      return job ? parseCtc(job.ctc) : 0;
    })
    .filter(function (v) {
      return v > 0;
    });

  const highest = ctcValues.length ? Math.max.apply(null, ctcValues) + " LPA" : "—";

  document.getElementById("tpo-subtitle").textContent =
    companies.length +
    " companies · " +
    jobs.length +
    " roles · " +
    applications.length +
    " applications";

  document.getElementById("stats-grid").innerHTML =
    '<div class="stat-pill glass"><label>Placement rate</label><div class="value">' +
    placementRate +
    '%</div></div><div class="stat-pill glass"><label>Highest package</label><div class="value">' +
    highest +
    '</div></div><div class="stat-pill glass"><label>Active drives</label><div class="value">' +
    openDrives +
    '</div></div><div class="stat-pill glass"><label>Total applications</label><div class="value">' +
    applications.length +
    "</div></div>";

  document.getElementById("drives-meta").textContent =
    openDrives + " open positions across campus";

  document.getElementById("drives-grid").innerHTML = jobs
    .map(function (job) {
      const meta = getCompanyMeta(job.company_id);
      const companyName = getCompanyName(job.company_id);
      const count = applications.filter(function (a) {
        return a.job_id === job.id;
      }).length;

      return (
        '<article class="job-card-premium glass"><div class="job-card-top"><div class="company-logo" style="background:' +
        meta.color +
        '">' +
        meta.initials +
        '</div><div style="flex:1"><h3>' +
        escapeHtml(job.title) +
        '</h3><p class="company-name">' +
        escapeHtml(companyName) +
        '</p></div><span class="badge badge-' +
        (job.status === "open" ? "eligible" : "neutral") +
        '">' +
        job.status +
        '</span></div><div class="job-tags"><span class="tag">' +
        escapeHtml(job.ctc) +
        '</span><span class="tag">' +
        count +
        ' apps</span><span class="tag">' +
        escapeHtml(job.location) +
        "</span></div></article>"
      );
    })
    .join("");

  const list = document.getElementById("placements-list");
  const empty = document.getElementById("placements-empty");

  if (selected.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  list.innerHTML = selected
    .map(function (app) {
      const student = db.users.find(function (u) {
        return u.id === app.student_id;
      });
      const job = getJobById(app.job_id);
      const meta = job ? getCompanyMeta(job.company_id) : { color: "#5e5ce6", initials: "?" };

      return (
        '<div class="job-card-premium glass" style="margin-bottom:0.75rem"><div class="job-card-top"><div class="company-logo" style="background:' +
        meta.color +
        '">' +
        meta.initials +
        '</div><div style="flex:1"><h3>' +
        escapeHtml(student ? student.full_name : "—") +
        '</h3><p class="company-name">' +
        escapeHtml(job ? job.title : "—") +
        ' @ ' +
        escapeHtml(job ? getCompanyName(job.company_id) : "") +
        '</p></div><span class="job-ctc" style="color:var(--success);font-weight:700">' +
        escapeHtml(job ? job.ctc : "—") +
        "</span></div></div>"
      );
    })
    .join("");
}

renderDashboard();
