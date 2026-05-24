const DB_KEY = "campus_recruit_db";
const SESSION_KEY = "campus_recruit_session";
const DB_SEED_VERSION = 2;

function generateId() {
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
}

function getDefaultDb() {
  return {
    seedVersion: 0,
    users: [],
    studentDetails: {},
    jobs: [],
    applications: [],
  };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const db = getDefaultDb();
      saveDb(db);
      return db;
    }
    return JSON.parse(raw);
  } catch {
    const db = getDefaultDb();
    saveDb(db);
    return db;
  }
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(userId) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const db = loadDb();
  return db.users.find((u) => u.id === session.userId) || null;
}

function findUserByEmail(email) {
  const db = loadDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function registerUser({ fullName, email, password, userRole, branch, cgpa, backlogs }) {
  const db = loadDb();
  if (findUserByEmail(email)) {
    return { error: "An account with this email already exists." };
  }

  const user = {
    id: generateId(),
    full_name: fullName,
    email: email.toLowerCase(),
    password,
    user_role: userRole,
    company_meta: null,
    created_at: new Date().toISOString(),
  };

  db.users.push(user);

  if (userRole === "student") {
    db.studentDetails[user.id] = {
      id: user.id,
      branch: branch || "Not specified",
      cgpa: parseFloat(cgpa) || 0,
      backlogs: parseInt(backlogs, 10) || 0,
      skills: [],
      resume_url: null,
      university: "",
      year: "",
    };
  }

  saveDb(db);
  setSession(user.id);
  return { user };
}

function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { error: "Invalid email or password." };
  }
  setSession(user.id);
  return { user };
}

function logoutUser() {
  clearSession();
}

function getStudentDetails(userId) {
  const db = loadDb();
  return db.studentDetails[userId] || null;
}

function upsertStudentDetails(userId, data) {
  const db = loadDb();
  const existing = db.studentDetails[userId] || { id: userId };
  db.studentDetails[userId] = Object.assign(existing, {
    branch: data.branch,
    cgpa: parseFloat(data.cgpa),
    backlogs: parseInt(data.backlogs, 10),
    skills: data.skills || existing.skills || [],
    resume_url: data.resume_url || null,
    university: data.university || existing.university || "",
    year: data.year || existing.year || "",
    phone: data.phone || existing.phone || "",
  });
  saveDb(db);
  return db.studentDetails[userId];
}

function getOpenJobs() {
  const db = loadDb();
  return db.jobs.filter((j) => j.status === "open");
}

function getJobsByCompany(companyId) {
  const db = loadDb();
  return db.jobs.filter((j) => j.company_id === companyId);
}

function getAllJobs() {
  return loadDb().jobs;
}

function createJob(companyId, jobData) {
  const db = loadDb();
  const job = {
    id: generateId(),
    company_id: companyId,
    title: jobData.title,
    description: jobData.description,
    min_cgpa: parseFloat(jobData.min_cgpa),
    max_backlogs: parseInt(jobData.max_backlogs, 10),
    allowed_branches: jobData.allowed_branches,
    ctc: jobData.ctc,
    status: "open",
    job_type: jobData.job_type || "internship",
    duration: jobData.duration || "6 months",
    mode: jobData.mode || "hybrid",
    location: jobData.location || "Bangalore",
    created_at: new Date().toISOString(),
  };
  db.jobs.push(job);
  saveDb(db);
  return job;
}

function getCompanyMeta(companyId) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === companyId);
  if (!user || !user.company_meta) {
    return { initials: "CO", color: "#5e5ce6", sector: "Technology" };
  }
  return user.company_meta;
}

function getCompanyName(companyId) {
  const db = loadDb();
  const company = db.users.find((u) => u.id === companyId);
  return company ? company.full_name : "Company";
}

function getApplicationsByStudent(studentId) {
  const db = loadDb();
  return db.applications.filter((a) => a.student_id === studentId);
}

function getApplicationsForCompany(companyId) {
  const db = loadDb();
  const jobIds = db.jobs.filter((j) => j.company_id === companyId).map((j) => j.id);
  return db.applications.filter((a) => jobIds.includes(a.job_id));
}

function getAllApplications() {
  return loadDb().applications;
}

function hasApplied(studentId, jobId) {
  const db = loadDb();
  return db.applications.some(
    (a) => a.student_id === studentId && a.job_id === jobId
  );
}

function createApplication(studentId, jobId, eligibilityPassed, formData) {
  const db = loadDb();
  const application = {
    id: generateId(),
    student_id: studentId,
    job_id: jobId,
    status: "applied",
    eligibility_passed: eligibilityPassed,
    form_data: formData,
    created_at: new Date().toISOString(),
  };
  db.applications.push(application);
  saveDb(db);
  return application;
}

function getJobById(jobId) {
  const db = loadDb();
  return db.jobs.find((j) => j.id === jobId) || null;
}

function getStudentCount() {
  const db = loadDb();
  return db.users.filter((u) => u.user_role === "student").length;
}

function getAllCompanies() {
  const db = loadDb();
  return db.users.filter((u) => u.user_role === "company");
}

function resetDemoData() {
  localStorage.removeItem(DB_KEY);
  clearSession();
  loadDb();
  seedDemoData(true);
}

function quickLogin(email) {
  seedDemoData();
  const user = findUserByEmail(email);
  if (!user) {
    return { error: "Demo account missing. Reset demo data from home page." };
  }
  setSession(user.id);
  return { user };
}

function updateApplicationStatus(applicationId, status, companyId) {
  const db = loadDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) return { error: "Application not found." };

  const job = db.jobs.find((j) => j.id === app.job_id);
  if (!job || job.company_id !== companyId) {
    return { error: "Not allowed to update this application." };
  }

  const valid = [
    "applied",
    "test_shortlist",
    "interviewing",
    "selected",
    "rejected",
  ];
  if (!valid.includes(status)) {
    return { error: "Invalid status." };
  }

  app.status = status;
  saveDb(db);
  return { application: app };
}

const DEMO_ACCOUNTS = [
  {
    email: "student@demo.com",
    password: "demo123",
    full_name: "Priya Sharma",
    user_role: "student",
    branch: "CSE",
    cgpa: 8.2,
    backlogs: 0,
    university: "RV College of Engineering",
    year: "4th Year",
  },
  {
    email: "arjun@demo.com",
    password: "demo123",
    full_name: "Arjun Mehta",
    user_role: "student",
    branch: "ECE",
    cgpa: 7.6,
    backlogs: 0,
    university: "BMS College of Engineering",
    year: "4th Year",
  },
  {
    email: "sneha@demo.com",
    password: "demo123",
    full_name: "Sneha Patel",
    user_role: "student",
    branch: "IT",
    cgpa: 7.1,
    backlogs: 1,
    university: "PES University",
    year: "3rd Year",
  },
  {
    email: "hr@techcorp.demo",
    password: "demo123",
    full_name: "TechCorp India",
    user_role: "company",
    company_meta: { initials: "TC", color: "#5e5ce6", sector: "Enterprise SaaS" },
  },
  {
    email: "campus@razorpay.demo",
    password: "demo123",
    full_name: "Razorpay",
    user_role: "company",
    company_meta: { initials: "RZ", color: "#0C2451", sector: "Fintech" },
  },
  {
    email: "careers@flipkart.demo",
    password: "demo123",
    full_name: "Flipkart",
    user_role: "company",
    company_meta: { initials: "FK", color: "#2874F0", sector: "E-commerce" },
  },
  {
    email: "campus@infosys.demo",
    password: "demo123",
    full_name: "Infosys",
    user_role: "company",
    company_meta: { initials: "IN", color: "#007CC3", sector: "IT Services" },
  },
  {
    email: "india-campus@microsoft.demo",
    password: "demo123",
    full_name: "Microsoft India",
    user_role: "company",
    company_meta: { initials: "MS", color: "#00A4EF", sector: "Technology" },
  },
  {
    email: "eng-hiring@swiggy.demo",
    password: "demo123",
    full_name: "Swiggy",
    user_role: "company",
    company_meta: { initials: "SW", color: "#FC8019", sector: "Food Tech" },
  },
  {
    email: "amzn-campus@amazon.demo",
    password: "demo123",
    full_name: "Amazon",
    user_role: "company",
    company_meta: { initials: "AM", color: "#FF9900", sector: "E-commerce & Cloud" },
  },
  {
    email: "campus@gs.demo",
    password: "demo123",
    full_name: "Goldman Sachs",
    user_role: "company",
    company_meta: { initials: "GS", color: "#6B96C3", sector: "Finance" },
  },
  {
    email: "tpo@college.demo",
    password: "demo123",
    full_name: "Dr. Rajesh Kumar",
    user_role: "tpo",
  },
];

function ensureDemoUser(db, account) {
  let user = db.users.find(
    (u) => u.email.toLowerCase() === account.email.toLowerCase()
  );
  if (!user) {
    user = {
      id: generateId(),
      full_name: account.full_name,
      email: account.email.toLowerCase(),
      password: account.password,
      user_role: account.user_role,
      company_meta: account.company_meta || null,
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    if (account.user_role === "student") {
      db.studentDetails[user.id] = {
        id: user.id,
        branch: account.branch,
        cgpa: account.cgpa,
        backlogs: account.backlogs,
        skills: ["JavaScript", "Python", "SQL"],
        resume_url: null,
        university: account.university,
        year: account.year,
        phone: "+91 98765 43210",
      };
    }
  }
  return user;
}

function buildJobsCatalog(companiesByEmail) {
  const J = function (companyEmail, data) {
    return Object.assign(
      {
        id: generateId(),
        company_id: companiesByEmail[companyEmail].id,
        status: "open",
        job_type: "internship",
        created_at: new Date().toISOString(),
      },
      data
    );
  };

  return [
    J("hr@techcorp.demo", {
      title: "Software Engineering Intern",
      description:
        "Join our platform team building next-gen B2B tools. You'll ship features in React/Node, participate in code reviews, and own a capstone project over 6 months.",
      min_cgpa: 7.5,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT", "ECE"],
      ctc: "₹45,000 / month",
      duration: "6 months",
      mode: "hybrid",
      location: "Bangalore",
    }),
    J("hr@techcorp.demo", {
      title: "Product Management Intern",
      description:
        "Work with PMs on roadmap discovery, user research, and PRDs. Ideal for analytical minds with strong communication.",
      min_cgpa: 7.0,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT", "MBA"],
      ctc: "₹40,000 / month",
      duration: "6 months",
      mode: "onsite",
      location: "Bangalore",
    }),
    J("campus@razorpay.demo", {
      title: "Backend Engineering Intern",
      description:
        "Build high-throughput payment APIs in Go/Java. Mentorship from senior engineers, on-call shadowing, and fintech exposure.",
      min_cgpa: 8.0,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT"],
      ctc: "₹60,000 / month",
      duration: "6 months",
      mode: "hybrid",
      location: "Bangalore",
    }),
    J("campus@razorpay.demo", {
      title: "Data Science Intern",
      description:
        "Fraud detection, risk models, and experimentation. Python, SQL, and basic ML required.",
      min_cgpa: 7.5,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT", "ECE"],
      ctc: "₹55,000 / month",
      duration: "6 months",
      mode: "remote",
      location: "Remote",
    }),
    J("careers@flipkart.demo", {
      title: "SDE Intern — Supply Chain",
      description:
        "Optimize logistics algorithms and build internal tools at India's largest e-commerce scale.",
      min_cgpa: 7.5,
      max_backlogs: 1,
      allowed_branches: ["CSE", "IT", "ISE"],
      ctc: "₹50,000 / month",
      duration: "6 months",
      mode: "onsite",
      location: "Bangalore",
    }),
    J("careers@flipkart.demo", {
      title: "Android Development Intern",
      description:
        "Ship features on the Flipkart app. Kotlin, Jetpack Compose, and performance tuning.",
      min_cgpa: 7.0,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT"],
      ctc: "₹48,000 / month",
      duration: "6 months",
      mode: "hybrid",
      location: "Bangalore",
    }),
    J("campus@infosys.demo", {
      title: "Systems Engineering Intern",
      description:
        "Enterprise consulting exposure, mainframe modernization, and cloud migration projects.",
      min_cgpa: 6.5,
      max_backlogs: 2,
      allowed_branches: [],
      ctc: "₹25,000 / month",
      duration: "12 months",
      mode: "onsite",
      location: "Mysore / Pune",
    }),
    J("campus@infosys.demo", {
      title: "Digital Specialist Intern",
      description:
        "Salesforce, ServiceNow, and low-code platforms. Training provided.",
      min_cgpa: 6.0,
      max_backlogs: 3,
      allowed_branches: [],
      ctc: "₹22,000 / month",
      duration: "6 months",
      mode: "onsite",
      location: "Multiple cities",
    }),
    J("india-campus@microsoft.demo", {
      title: "Explore Microsoft Intern",
      description:
        "Rotational program across Azure, Office, and Gaming. World-class mentorship and conversion opportunities.",
      min_cgpa: 8.0,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT", "ECE"],
      ctc: "₹1,25,000 / month",
      duration: "12 weeks",
      mode: "hybrid",
      location: "Hyderabad / Bangalore",
    }),
    J("india-campus@microsoft.demo", {
      title: "Cloud Solutions Intern",
      description:
        "Customer-facing technical role supporting Azure adoption. Certifications sponsored.",
      min_cgpa: 7.5,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT"],
      ctc: "₹80,000 / month",
      duration: "6 months",
      mode: "hybrid",
      location: "Hyderabad",
    }),
    J("eng-hiring@swiggy.demo", {
      title: "Full Stack Engineering Intern",
      description:
        "Build features for restaurant partners and delivery logistics. Fast-paced startup environment.",
      min_cgpa: 7.0,
      max_backlogs: 1,
      allowed_branches: ["CSE", "IT", "MCA"],
      ctc: "₹42,000 / month",
      duration: "6 months",
      mode: "hybrid",
      location: "Bangalore",
    }),
    J("eng-hiring@swiggy.demo", {
      title: "ML Engineering Intern",
      description:
        "Demand forecasting, ETA prediction, and recommendation systems.",
      min_cgpa: 7.5,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT"],
      ctc: "₹55,000 / month",
      duration: "6 months",
      mode: "onsite",
      location: "Bangalore",
    }),
    J("amzn-campus@amazon.demo", {
      title: "SDE Intern — AWS",
      description:
        "Distributed systems at global scale. Leadership principles culture, bar-raiser interviews.",
      min_cgpa: 7.5,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT", "ECE"],
      ctc: "₹1,10,000 / month",
      duration: "6 months",
      mode: "onsite",
      location: "Bangalore / Chennai",
    }),
    J("amzn-campus@amazon.demo", {
      title: "Business Intelligence Intern",
      description:
        "SQL, QuickSight, and data pipelines for retail operations.",
      min_cgpa: 7.0,
      max_backlogs: 1,
      allowed_branches: ["CSE", "IT", "ISE"],
      ctc: "₹65,000 / month",
      duration: "6 months",
      mode: "hybrid",
      location: "Bangalore",
    }),
    J("campus@gs.demo", {
      title: "Engineering Analyst Intern",
      description:
        "Low-latency trading systems, risk analytics, and quantitative research support.",
      min_cgpa: 8.5,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT", "ECE"],
      ctc: "₹1,50,000 / month",
      duration: "10 weeks",
      mode: "onsite",
      location: "Bangalore",
    }),
    J("campus@gs.demo", {
      title: "Operations Analyst Intern",
      description:
        "Process optimization and data-driven decision making in global markets.",
      min_cgpa: 7.5,
      max_backlogs: 0,
      allowed_branches: ["CSE", "IT", "MBA"],
      ctc: "₹90,000 / month",
      duration: "8 weeks",
      mode: "onsite",
      location: "Bangalore",
    }),
    J("hr@techcorp.demo", {
      title: "Graduate Trainee — Full Time",
      description:
        "Rotational program leading to full-time offer. All engineering branches welcome with strong academics.",
      min_cgpa: 6.5,
      max_backlogs: 2,
      allowed_branches: [],
      ctc: "12 LPA",
      job_type: "fulltime",
      duration: "Permanent",
      mode: "hybrid",
      location: "Bangalore",
    }),
  ];
}

function seedSampleApplications(db, students, jobs) {
  if (db.applications.length > 0) return;

  const priya = students["student@demo.com"];
  const arjun = students["arjun@demo.com"];
  const sneha = students["sneha@demo.com"];
  if (!priya || !jobs.length) return;

  const sampleForm = {
    personal: {
      phone: "+91 98765 43210",
      linkedin: "linkedin.com/in/priyasharma",
      city: "Bangalore",
      dob: "2002-05-15",
    },
    academic: {
      university: "RV College of Engineering",
      year: "4th Year",
      branch: "CSE",
      cgpa: 8.2,
      backlogs: 0,
      semester: "8",
    },
    skills: {
      technical: "JavaScript, React, Node.js, Python",
      tools: "Git, Docker, Figma",
      certifications: "AWS Cloud Practitioner",
    },
    experience: {
      projects: "Campus placement portal, ML attendance system",
      prior_internships: "Startup web dev intern (2 months)",
    },
    preferences: {
      duration: "6 months",
      mode: "hybrid",
      location: "Bangalore",
      stipend_min: "40000",
      join_date: "2025-06-01",
    },
    documents: {
      resume_url: "https://drive.google.com/resume-priya",
      portfolio_url: "https://github.com/priyasharma",
      cover_letter: "Passionate about building products at scale.",
    },
    statement: {
      why_company: "Aligned with your mission and tech stack.",
      career_goals: "Full-time SDE role post-internship.",
    },
  };

  const apps = [
    { student: priya, jobIndex: 0, status: "interviewing", eligibility: true },
    { student: priya, jobIndex: 2, status: "test_shortlist", eligibility: true },
    { student: priya, jobIndex: 8, status: "applied", eligibility: true },
    { student: arjun, jobIndex: 4, status: "applied", eligibility: true },
    { student: arjun, jobIndex: 6, status: "rejected", eligibility: true },
    { student: sneha, jobIndex: 6, status: "applied", eligibility: true },
    { student: sneha, jobIndex: 9, status: "selected", eligibility: true },
  ];

  apps.forEach(function (a) {
    if (!a.student || !jobs[a.jobIndex]) return;
    db.applications.push({
      id: generateId(),
      student_id: a.student.id,
      job_id: jobs[a.jobIndex].id,
      status: a.status,
      eligibility_passed: a.eligibility,
      form_data: JSON.parse(JSON.stringify(sampleForm)),
      created_at: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
    });
  });
}

function seedDemoData(force) {
  const db = loadDb();

  if (!force && db.seedVersion === DB_SEED_VERSION) {
    return;
  }

  if (force) {
    db.users = [];
    db.studentDetails = {};
    db.jobs = [];
    db.applications = [];
  }

  const companiesByEmail = {};
  const studentsByEmail = {};

  DEMO_ACCOUNTS.forEach(function (account) {
    const user = ensureDemoUser(db, account);
    if (account.user_role === "company") {
      companiesByEmail[account.email] = user;
    }
    if (account.user_role === "student") {
      studentsByEmail[account.email] = user;
    }
  });

  const needsCatalog =
    force || db.seedVersion !== DB_SEED_VERSION || db.jobs.length < 15;

  if (needsCatalog) {
    db.jobs = buildJobsCatalog(companiesByEmail);
    db.applications = [];
    seedSampleApplications(db, studentsByEmail, db.jobs);
  }

  db.seedVersion = DB_SEED_VERSION;
  saveDb(db);
}
