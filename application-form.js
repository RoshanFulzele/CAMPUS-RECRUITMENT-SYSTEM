/**
 * Premium multi-step internship application wizard
 */
const APPLY_STEPS = [
  "Personal",
  "Academic",
  "Skills",
  "Preferences",
  "Documents",
  "Review",
];

let applyWizardStep = 0;
let applyWizardJob = null;
let applyWizardUser = null;

function getApplyFormData() {
  return {
    personal: {
      phone: document.getElementById("f-phone").value.trim(),
      linkedin: document.getElementById("f-linkedin").value.trim(),
      city: document.getElementById("f-city").value.trim(),
      dob: document.getElementById("f-dob").value,
    },
    academic: {
      university: document.getElementById("f-university").value.trim(),
      year: document.getElementById("f-year").value,
      branch: document.getElementById("f-branch").value.trim(),
      cgpa: parseFloat(document.getElementById("f-cgpa").value),
      backlogs: parseInt(document.getElementById("f-backlogs").value, 10),
      semester: document.getElementById("f-semester").value.trim(),
    },
    skills: {
      technical: document.getElementById("f-technical").value.trim(),
      tools: document.getElementById("f-tools").value.trim(),
      certifications: document.getElementById("f-certifications").value.trim(),
    },
    experience: {
      projects: document.getElementById("f-projects").value.trim(),
      prior_internships: document.getElementById("f-prior-internships").value.trim(),
    },
    preferences: {
      duration: document.getElementById("f-pref-duration").value,
      mode: document.getElementById("f-pref-mode").value,
      location: document.getElementById("f-pref-location").value.trim(),
      stipend_min: document.getElementById("f-stipend").value.trim(),
      join_date: document.getElementById("f-join-date").value,
    },
    documents: {
      resume_url: document.getElementById("f-resume").value.trim(),
      portfolio_url: document.getElementById("f-portfolio").value.trim(),
      cover_letter: document.getElementById("f-cover-letter").value.trim(),
    },
    statement: {
      why_company: document.getElementById("f-why-company").value.trim(),
      career_goals: document.getElementById("f-career-goals").value.trim(),
    },
  };
}

function renderWizardProgress() {
  const bars = document.getElementById("wizard-bars");
  const labels = document.getElementById("wizard-labels");
  if (!bars) return;

  bars.innerHTML = APPLY_STEPS.map(function (_, i) {
    return (
      '<div class="step-bar' +
      (i <= applyWizardStep ? " fill" : "") +
      '"></div>'
    );
  }).join("");

  labels.innerHTML =
    "<span>Step " +
    (applyWizardStep + 1) +
    " of " +
    APPLY_STEPS.length +
    "</span><span>" +
    APPLY_STEPS[applyWizardStep] +
    "</span>";
}

function showApplyStep(step) {
  applyWizardStep = step;
  for (let i = 0; i < APPLY_STEPS.length; i++) {
    const panel = document.getElementById("apply-panel-" + i);
    if (panel) panel.classList.toggle("hidden", i !== step);
  }

  const backBtn = document.getElementById("apply-back-btn");
  const nextBtn = document.getElementById("apply-next-btn");
  backBtn.classList.toggle("hidden", step === 0);
  nextBtn.textContent =
    step === APPLY_STEPS.length - 1 ? "Submit Application ✓" : "Continue →";

  renderWizardProgress();

  if (step === APPLY_STEPS.length - 1) {
    renderReviewPanel();
  }
}

function validateApplyStep(step) {
  const alertBox = document.getElementById("apply-alert");
  alertBox.innerHTML = "";

  if (step === 0) {
    if (!document.getElementById("f-phone").value.trim())
      return "Phone number is required.";
    if (!document.getElementById("f-city").value.trim()) return "City is required.";
  }
  if (step === 1) {
    if (!document.getElementById("f-university").value.trim())
      return "University is required.";
    if (!document.getElementById("f-branch").value.trim()) return "Branch is required.";
    const cgpa = parseFloat(document.getElementById("f-cgpa").value);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) return "Valid CGPA (0–10) required.";
  }
  if (step === 2) {
    if (!document.getElementById("f-technical").value.trim())
      return "List at least your core technical skills.";
    if (!document.getElementById("f-projects").value.trim())
      return "Describe at least one project.";
  }
  if (step === 4) {
    if (!document.getElementById("f-resume").value.trim())
      return "Resume URL is required.";
    if (!document.getElementById("f-why-company").value.trim())
      return "Tell us why you want to join this company.";
    if (document.getElementById("f-why-company").value.trim().length < 50)
      return "Why this company — please write at least 50 characters.";
  }
  return null;
}

function renderReviewPanel() {
  const data = getApplyFormData();
  const job = applyWizardJob;
  const companyName = getCompanyName(job.company_id);
  const meta = getCompanyMeta(job.company_id);

  document.getElementById("apply-review").innerHTML =
    '<div class="job-card-top" style="margin-bottom:1rem">' +
    '<div class="company-logo" style="background:' +
    meta.color +
    '">' +
    meta.initials +
    "</div><div><h3>" +
    escapeHtml(job.title) +
    '</h3><p class="company-name">' +
    escapeHtml(companyName) +
    "</p></div></div>" +
    '<div class="form-section-title">Personal</div><div class="review-grid">' +
    reviewRow("Phone", data.personal.phone) +
    reviewRow("City", data.personal.city) +
    reviewRow("LinkedIn", data.personal.linkedin || "—") +
    '</div><div class="form-section-title">Academic</div><div class="review-grid">' +
    reviewRow("University", data.academic.university) +
    reviewRow("Branch", data.academic.branch) +
    reviewRow("CGPA", data.academic.cgpa) +
    reviewRow("Backlogs", data.academic.backlogs) +
    '</div><div class="form-section-title">Preferences</div><div class="review-grid">' +
    reviewRow("Duration", data.preferences.duration) +
    reviewRow("Mode", data.preferences.mode) +
    reviewRow("Join date", data.preferences.join_date || "Flexible") +
    "</div>";
}

function reviewRow(label, value) {
  return (
    '<div class="review-row"><dt>' +
    escapeHtml(label) +
    "</dt><dd>" +
    escapeHtml(String(value)) +
    "</dd></div>"
  );
}

function openInternshipApplicationForm(job, user) {
  applyWizardJob = job;
  applyWizardUser = user;
  applyWizardStep = 0;

  const details = getStudentDetails(user.id);
  const meta = getCompanyMeta(job.company_id);

  document.getElementById("apply-modal-title").textContent =
    "Internship Application";
  document.getElementById("apply-modal-desc").textContent =
    "Apply to " + job.title + " at " + getCompanyName(job.company_id);
  document.getElementById("apply-job-id").value = job.id;
  document.getElementById("apply-alert").innerHTML = "";

  if (details) {
    document.getElementById("f-branch").value = details.branch || "";
    document.getElementById("f-cgpa").value = details.cgpa ?? "";
    document.getElementById("f-backlogs").value = details.backlogs ?? 0;
    document.getElementById("f-university").value = details.university || "";
    document.getElementById("f-year").value = details.year || "4th Year";
    document.getElementById("f-phone").value = details.phone || "";
  }

  document.getElementById("f-pref-duration").value = job.duration || "6 months";
  document.getElementById("f-pref-mode").value =
    job.mode === "remote" ? "remote" : job.mode === "onsite" ? "onsite" : "hybrid";
  document.getElementById("f-pref-location").value = job.location || "";

  showApplyStep(0);
  openModal("apply-modal");
}

function submitInternshipApplication() {
  const alertBox = document.getElementById("apply-alert");
  const jobId = document.getElementById("apply-job-id").value;
  const job = getJobById(jobId);
  const formData = getApplyFormData();

  const studentData = {
    branch: formData.academic.branch,
    cgpa: formData.academic.cgpa,
    backlogs: formData.academic.backlogs,
  };

  if (hasApplied(applyWizardUser.id, jobId)) {
    showAlert(alertBox, "You have already applied to this opportunity.", "error");
    return;
  }

  const result = checkEligibility(studentData, job);

  if (!result.eligible) {
    showAlertList(alertBox, "Eligibility check failed", result.reasons);
    return;
  }

  upsertStudentDetails(applyWizardUser.id, {
    branch: formData.academic.branch,
    cgpa: formData.academic.cgpa,
    backlogs: formData.academic.backlogs,
    skills: formData.skills.technical.split(",").map(function (s) {
      return s.trim();
    }),
    resume_url: formData.documents.resume_url,
    university: formData.academic.university,
    year: formData.academic.year,
    phone: formData.personal.phone,
  });

  createApplication(applyWizardUser.id, jobId, true, formData);
  closeModal("apply-modal");
  showToast("Application submitted successfully!", "success");
  if (typeof onApplicationSubmitted === "function") {
    onApplicationSubmitted();
  }
}

function initApplicationWizard() {
  document.getElementById("apply-next-btn").addEventListener("click", function () {
    const err = validateApplyStep(applyWizardStep);
    const alertBox = document.getElementById("apply-alert");
    if (err) {
      showAlert(alertBox, err, "error");
      return;
    }
    alertBox.innerHTML = "";

    if (applyWizardStep < APPLY_STEPS.length - 1) {
      showApplyStep(applyWizardStep + 1);
    } else {
      submitInternshipApplication();
    }
  });

  document.getElementById("apply-back-btn").addEventListener("click", function () {
    if (applyWizardStep > 0) showApplyStep(applyWizardStep - 1);
  });

  initModalClose("apply-modal");
}
