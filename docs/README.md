# CodeNest — Documentation Index

This folder contains all supplementary documentation for the CodeNest project.

---

## Folder Structure

```
docs/
├── README.md              # This file — documentation index
├── fixes/                 # Feature & fix documentation (130+ files)
├── thesis-generation/     # Thesis generation scripts
└── utilities/             # Utility/test scripts
```

---

## Quick Links

| Document | Description |
|---|---|
| [Main README](../README.md) | Project overview, setup, API reference |
| [User Manual — Students](../README.md#user-manual--students) | How students use CodeNest |
| [User Manual — Teachers](../README.md#user-manual--teachers) | How teachers use CodeNest |
| [Feature Docs](fixes/) | All feature and fix documentation |

---

## Feature Documentation (`fixes/`)

130+ markdown files covering every feature, fix, and improvement:

- **Authentication & Users** — login, registration, JWT, profiles
- **Problem Solving** — code editor, submissions, test cases, judging
- **Contests** — creation, participation, leaderboards
- **Achievements** — badge system, toast notifications, progress tracking
- **AI Assistant** — Groq integration, context-aware help
- **Analytics** — heatmaps, dashboards, statistics, scoreboard
- **Discussion** — forums, threaded replies
- **Platform Sync** — LeetCode, CodeChef, Codeforces, HackerRank integration
- **Technical** — setup guides, API docs, deployment, CORS, Docker

**Naming convention:**
- `FEATURE_COMPLETE.md` — fully implemented
- `FEATURE_VERIFIED.md` — tested and verified
- `FEATURE_STATUS.md` — current status
- `FEATURE_GUIDE.md` — setup/usage guide
- `FEATURE_FIX.md` — bug fix documentation

---

## Thesis Generation (`thesis-generation/`)

Scripts used to generate the academic thesis document:

- `generate_complete_thesis.py` — main generator
- `add_lists_and_figures.py` — figures, tables, abbreviations
- `replace_tables_list.py` — CodeNest-specific table listings
- `add_missing_sections.py` — missing chapter sections

Output: `../codenest_comprehensive.docx`

---

## Utilities (`utilities/`)

Test and verification scripts:

- `test_ai.py` — AI assistant functionality
- `test_execute_api.py` — code execution API
- `test_registration.py` — user registration flow
- `verify_api.py` — all API endpoints
- `create_db.py` — database initialization

---

Made with ❤️ by the CodeNest Team
