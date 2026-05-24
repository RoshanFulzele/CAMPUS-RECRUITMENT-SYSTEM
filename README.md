# CampusRecruit — HTML / CSS / JavaScript

**Zero setup.** Works offline in your browser.

## Fastest start (Windows)

Double-click **`START.bat`** — opens the app in your browser.

Or double-click **`index.html`**.

## One-click demo

Open the home page and click:

| Role | Email | Password |
|------|-------|----------|
| Student | `student@demo.com` | `demo123` |
| Company | `hr@techcorp.demo` | `demo123` |
| TPO | `tpo@college.demo` | `demo123` |

3 sample jobs are included. Student Priya (CSE, 8.2 CGPA) can apply to drives; Company can move applicants to **Selected**; TPO sees placement stats update.

## Try the full flow

1. **Enter as Student** → apply to "Software Engineer"
2. **Enter as Company** → Applicants table → change status to **Interviewing** or **Selected**
3. **Enter as TPO** → see placement rate and placements list

## Files

```
index.html      Home + demo login
login.html      Sign in
register.html   New account
student.html    Student dashboard
company.html    Company dashboard
tpo.html        TPO dashboard
css/styles.css
js/storage.js   localStorage database
js/eligibility.js
js/auth.js
js/ui.js
```

## Reset

Home page footer → **Reset demo data** (recreates demo accounts and jobs).

## Note

The Next.js + Supabase version in the parent folder is for production. This folder is the easy local demo.
