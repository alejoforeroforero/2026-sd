# Systems After Hours

A buildless system design study quiz: **213 questions across 19 topics**, with **135 multiple-choice** and **78 fill-in-the-blank** questions. Plain HTML, CSS, and JavaScript. No dependencies, backend, database, account, or build command.

## Run

Open `index.html` directly or run `python3 -m http.server 8080` in this folder, then open http://localhost:8080. The app does not register an offline worker on any host.

## Publish with Git and Vercel

The website lives at the root of [alejoforeroforero/2026-sd](https://github.com/alejoforeroforero/2026-sd). Import that repository in Vercel and use:

- Framework preset: **Other**
- Root Directory: **leave at the repository root**
- Build command: **leave empty**
- Output directory: **`.`**
- No environment variables or install step needed.

These settings follow [Vercel’s static-site build guidance](https://vercel.com/docs/builds/configure-a-build). Push future website changes to `main`; once Vercel is connected, its Git integration can deploy those pushes. Uploading to GitHub does not itself publish the website.

## Use on your iPhone

Open **https://2026-sd.vercel.app/latest** online once to bypass any old cached homepage. The new page removes this quiz’s previous offline registration and file caches. Existing answers, bookmarks, and saved sessions stay in localStorage.

You can still use Safari’s **Share → Add to Home Screen** and launch the standalone app. This app is now **online-only**: HTML and assets use no-store response headers, and no new offline caches are created. Keep the phone connected when opening or refreshing it. Existing Home Screen installations may need to be fully closed and reopened online once so the retirement worker can replace their old worker. iOS may use separate storage for Safari and Home Screen apps.

`sw.js` remains at its original URL only to retire old registrations: it skips waiting, deletes only the quiz’s file caches, unregisters itself, and navigates open app clients to the network version. It has no fetch handler. `pwa.js` also cleans up any remaining quiz registration on a fresh page, without registering another worker. Neither file clears localStorage.

`vercel.json` disables browser/CDN response caching and maps `/latest` to the same app. Release query strings on the app’s stylesheet/scripts bypass previously cached unversioned files during migration. The manifest and icons remain for Home Screen use.

References: [Chrome’s worker retirement guidance](https://developer.chrome.com/docs/workbox/remove-buggy-service-workers), [Vercel cache headers](https://vercel.com/docs/caching/cache-control-headers).

## Interface

The interface uses compact screen titles and controls without introductory text, slogans, keyboard tips, or general app instructions. Question explanations, references, topic descriptions, scoring labels, empty states, and the reset confirmation remain. The question coverage map is on Progress; the home screen shows compact bank totals.

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

## Functional, non-functional, or architecture?

Choose **Requirements & architecture** from the topic list (or Explore topics on mobile) for focused practice. Select **All** to practice its 26 questions. New questions are also included in randomized mixed sessions.

| Stage | Question it answers | Example |
| --- | --- | --- |
| Functional requirements | What can users do? | Upload and share files. |
| Non-functional requirements | How well must it work? | Durable storage; updates within one second under agreed conditions. |
| High-level architecture | What components support that? | Object storage, metadata database, backend API, SSE. |

The new scenarios ask you to classify statements, match the question to the stage, correct misplaced component choices, and distinguish a capability from a quality target and its supporting design. Explanations compare the categories rather than relying on isolated keywords. Existing question IDs and the saved-progress version are unchanged, so earlier progress and sessions remain valid. The app now loads from the network without an offline file cache.

## Developer interview fundamentals

Added **15 React**, **15 Next.js**, and **15 Node.js & JavaScript** questions. These mix practical design/debugging scenarios with recall of key APIs. Select a topic and **All** to practice its complete 15-question set, or include it in mixed sessions.

- React: shared state, state snapshots/updaters, immutable updates, list identity, Effect cleanup, derived state, refs, error boundaries, memoization, custom Hooks, context, and Hook rules.
- Next.js (App Router): server/client module boundaries, initial HTML, direct server data access, Server Action authorization, cache policies, mutations and other open clients, parallel fetching, webhooks, safe DTOs, route/loading/error files, and public environment variables.
- Node.js & JavaScript: non-blocking I/O, CPU offloading, promise composition/errors, async loops, streams, cancellation, const semantics, shutdown, closures, and the event loop.

Each new question links to its primary documentation after answering and in the answer review. References were checked October 26, 2026; see [SOURCES.md](SOURCES.md). Next.js questions identify the App Router and avoid treating version-dependent caching defaults as universal. API-recall questions name their context (for example, TypeScript route files). This is useful interview practice, not a claim that any particular employer will ask these exact questions.

Existing question IDs and stored progress remain unchanged. Offline caching has since been removed; the app now loads from the network.

## Content and coverage

Topics: requirements/architecture, networking/delivery, databases/modeling, APIs, scaling/capacity, reliability/recovery, caching/consistency, real-time systems, concurrency, security/access, frontend state, rendering/fetching, performance/accessibility, debugging/races, testing/deployment, React, Next.js, and Node.js/JavaScript. Requirements & architecture has 26 questions, including 18 focused comparisons based on your reference table (12 choice, six blanks). React, Next.js, and Node.js & JavaScript each have 15 questions (10 choice, five blanks). The remaining 14 topics each have eight questions (five choice, three blanks).

The content is based on the existing SD practice material through Day 14: the collaborative task-management study guide and interview; Days 2–9 networking, PERC data/API/scaling/reliability, collaborative editing and trade-offs; Day 10 frontend architecture/state ownership; Day 11 rendering/fetching/caching; Day 12 performance/accessibility; Day 13 debugging; Day 14 testing/review/deployment. The URL-shortener scenario also draws from the project prompts. Some questions turn the lessons into a small application or calculation exercise.

The study materials and original interview scripts are kept separately from this repository. The original scripts were located through references in the existing audio manifests. Source labels appear after each question. The site does not need those source files to run and does not publish their full contents.

This is broad coverage of **your current material**, not an exhaustive catalog of system design. DSA is separate. Larger topics such as consensus algorithms, deep distributed transactions, and geospatial matching would need additional questions as you study them. Short answers support recall; also rehearse explaining a complete design aloud.

## Edit

- `index.html`: document shell.
- `styles.css`: responsive night theme; system fonts, no external assets or requests.
- `questions.js`: self-contained bank. `mc(prompt, correctAnswer, threeDistractors, explanation)` or `blank(prompt, acceptedAnswers, explanation)` adds a question to its section.
- `app.js`: session, grading, filters, progress, rendering, and browser storage.
- `manifest.webmanifest`, `icons/`: Home Screen launch settings and icons.
- `pwa.js`, `sw.js`: retirement of old quiz workers and file caches. Keep `sw.js` available for previously installed clients; it must not cache or intercept requests.
- `vercel.json`: no-store browser/CDN headers and the `/latest` recovery URL.

Question IDs are derived from their topic and position within that topic. Append new entries to a topic to preserve existing IDs. If you reorder or repurpose existing entries, bump `version` in `questions.js` so old answer records are not attributed to different questions. Also update the visible counts when changing the bank size.

## Check the bank

Node is optional and only needed for this authoring check:

```sh
node check-bank.cjs
```

It checks IDs, topic distribution, correct-answer membership, unique choices, blank aliases, and the expected 213-question inventory. The app itself does not require Node.

## Time & space complexity

30 questions (18 multiple-choice, 12 fill-in-the-blank), including 17 original JavaScript snippets. Covers constant, logarithmic, linear, linearithmic, quadratic and exponential growth; sequential, nested, triangular and independent-input loops; binary/linear search; output vs auxiliary memory; recursive stack depth; memoization and amortized analysis. Questions specify input size, cost assumptions and the case being analyzed. Big O exercises request the tightest bound; notation answers tolerate whitespace, case, and listed exponent aliases. Optional `code` strings are escaped and shown in scrollable blocks during questions and answer review. Existing question IDs and local progress are preserved.
