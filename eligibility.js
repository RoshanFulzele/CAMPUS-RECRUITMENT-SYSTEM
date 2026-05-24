function checkEligibility(student, job) {
  const reasons = [];
  const studentCgpa = Number(student.cgpa);
  const requiredCgpa = Number(job.min_cgpa);

  if (studentCgpa < requiredCgpa) {
    reasons.push(
      "Disqualified: Your CGPA (" +
        studentCgpa +
        ") is below the required " +
        requiredCgpa
    );
  }

  if (student.backlogs > job.max_backlogs) {
    reasons.push(
      "Disqualified: Your backlogs (" +
        student.backlogs +
        ") exceed the maximum allowed " +
        job.max_backlogs
    );
  }

  const branchNorm = (student.branch || "").trim().toLowerCase();
  const allowed = (job.allowed_branches || []).map((b) =>
    b.trim().toLowerCase()
  );

  if (allowed.length > 0 && !allowed.includes(branchNorm)) {
    reasons.push(
      'Disqualified: Your branch (' +
        student.branch +
        ") is not among the allowed branches (" +
        job.allowed_branches.join(", ") +
        ")"
    );
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

function previewEligibility(student, job) {
  return checkEligibility(student, job).eligible ? "eligible" : "check_criteria";
}
