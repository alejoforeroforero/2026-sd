# Systems After Hours

A buildless system design study quiz: **120 questions across 15 topics**, with **75 multiple-choice** and **45 fill-in-the-blank** questions. Plain HTML, CSS, and JavaScript. No dependencies, backend, database, account, or build command.

## Run

Open `index.html` directly, or serve this folder:

```sh
python3 -m http.server 8080
```

Then open http://localhost:8080. Browser storage can behave differently for `file:` URLs, so use the local server for reliable previewing.

## Publish with Git and Vercel

The website lives at the root of [alejoforeroforero/2026-sd](https://github.com/alejoforeroforero/2026-sd). Import that repository in Vercel and use:

- Framework preset: **Other**
- Root Directory: **leave at the repository root**
- Build command: **leave empty**
- Output directory: **`.`**
- No environment variables or install step needed.

These settings follow [Vercel’s static-site build guidance](https://vercel.com/docs/builds/configure-a-build). Push future website changes to `main`; once Vercel is connected, its Git integration can deploy those pushes. Uploading to GitHub does not itself publish the website.

## Install on your iPhone

1. After deployment, open your **HTTPS Vercel URL** in Safari on your iPhone. The computer’s `127.0.0.1` preview URL is not accessible from your phone.
2. Use **Share → Add to Home Screen**. Keep **Open as Web App** enabled if that option appears, then tap **Add**.
3. Launch **Systems** from its Home Screen icon while online once so the app can finish caching its files. After that, the questions and explanations work offline while the cached files remain on the device.

The app includes a standalone web-app manifest, iPhone PNG icon, safe-area spacing, large touch controls, and 16px form fields. It allows portrait and landscape use and does not disable pinch zoom. Offline support uses a small service worker, with no backend or extra dependencies.

Study consistently from the Home Screen app: iOS can keep its storage separate from Safari tabs. Progress is still local to that installation and device, without cloud sync. Removing website data can erase it; the operating system can also evict cached resources.

For website updates, connect to the internet, open the app to let it download a new version, close all open app windows, and reopen. Updates wait for existing windows to close so an in-progress session does not mix JavaScript and question-bank versions.

Implementation references: [WebKit Home Screen web apps](https://webkit.org/blog/13878/), [WebKit safe-area guidance](https://webkit.org/blog/7929/designing-websites-for-iphone-x/), and [Apple’s explanation of separate Home Screen storage](https://developer.apple.com/videos/play/wwdc2023/10120/).

## Study behavior

- Choose 10, 20, 40, or all available questions. If filters leave fewer, the session uses that number.
- Question order and multiple-choice answer order are shuffled at the start of every session. No question repeats within a session. The shuffled order survives resuming.
- Practice everything, questions missed on the latest attempt, or saved questions. Combine this with topic and format filters.
- Answers are checked once per session question. Explanations and study references appear after checking or revealing.
- Revealing counts as a missed attempt and includes the question in review. A later correct attempt removes it from the missed pool.
- Blank answers ignore case, surrounding spaces, repeated whitespace, hyphens/underscores, and trailing sentence punctuation. Explicit aliases live in the question bank; no fuzzy or AI grading.
- Progress, bookmarks, draft answer, answer order, and the current session are saved in `localStorage`. Resume from the home screen after refresh. Starting a new session replaces the active session, while preserving answer history.
- All-time accuracy includes repeated attempts and revealed answers. Topic progress means **correct on the latest attempt**, not a claim of mastery.
- Data stays on the current browser/device and does not synchronize. Clearing site data removes it. The quiz still works in memory if storage is unavailable.
- Keyboard: Tab/arrow keys for controls, 1–4 to choose an option when not typing, Enter to submit/check or continue. Native radio controls also support arrows and Space.

## Content and coverage

Topics: requirements/architecture, networking/delivery, databases/modeling, APIs, scaling/capacity, reliability/recovery, caching/consistency, real-time systems, concurrency, security/access, frontend state, rendering/fetching, performance/accessibility, debugging/races, and testing/deployment. Eight questions per topic (five choice, three blanks).

The content is based on the existing SD practice material through Day 14: the collaborative task-management study guide and interview; Days 2–9 networking, PERC data/API/scaling/reliability, collaborative editing and trade-offs; Day 10 frontend architecture/state ownership; Day 11 rendering/fetching/caching; Day 12 performance/accessibility; Day 13 debugging; Day 14 testing/review/deployment. The URL-shortener scenario also draws from the project prompts. Some questions turn the lessons into a small application or calculation exercise.

The study materials and original interview scripts are kept separately from this repository. The original scripts were located through references in the existing audio manifests. Source labels appear after each question. The site does not need those source files to run and does not publish their full contents.

This is broad coverage of **your current material**, not an exhaustive catalog of system design. DSA is separate. Larger topics such as consensus algorithms, deep distributed transactions, and geospatial matching would need additional questions as you study them. Short answers support recall; also rehearse explaining a complete design aloud.

## Edit

- `index.html`: document shell.
- `styles.css`: responsive night theme; system fonts, no external assets or requests.
- `questions.js`: self-contained bank. `mc(prompt, correctAnswer, threeDistractors, explanation)` or `blank(prompt, acceptedAnswers, explanation)` adds a question to its section.
- `app.js`: session, grading, filters, progress, rendering, and browser storage.
- `manifest.webmanifest`, `icons/`: Home Screen launch settings and icons.
- `pwa.js`, `sw.js`: optional offline installation and versioned file caching. Whenever a cached website file changes, increment `CACHE_NAME` in `sw.js`. The cache version and question-bank data version serve different purposes.

Question IDs are derived from their topic and position within that topic. Append new entries to a topic to preserve existing IDs. If you reorder or repurpose existing entries, bump `version` in `questions.js` so old answer records are not attributed to different questions. Also update the visible counts when changing the bank size.

## Check the bank

Node is optional and only needed for this authoring check:

```sh
node check-bank.cjs
```

It checks IDs, topic distribution, correct-answer membership, unique choices, blank aliases, and the expected 120-question inventory. The app itself does not require Node.
