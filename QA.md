# Verification

Checked locally on October 19, 2026. No production deployment was made.

- Bank check: 120 unique IDs; 15 topics with eight questions each; 75 choice and 45 blank; four distinct options per choice; valid correct answers, aliases, and explanations.
- JavaScript syntax check passed.
- Browser session completed all 120 questions. One intentional incorrect answer and one reveal produced 118/120; all other tested answers, including blank aliases with changed case, spaces, and punctuation, were accepted.
- The answer review contained all 120 questions; retry selected only the two missed questions.
- Question IDs did not repeat inside sessions. Shuffled choices and current answers survived refresh and resume.
- Tested bookmarks from questions and result review, saved-mode filtering, save/exit, blank draft recovery, empty missed mode, no-topic selection, and combined topic/format filters.
- Tested 1–4 selection (including changing a selected answer), Enter submission/continuation, navigation with Enter, focus retention, and cancel/confirm reset.
- No horizontal overflow on the home screen at 320, 390, 768, 1024, and 1440 pixels. Checked topic, progress, question, and feedback screens at 390 pixels. Visually inspected desktop home and mobile feedback screenshots.
- Browser console reported zero errors or warnings. Resource inspection found no external runtime requests.
- Cleared the test browser’s quiz history after QA.

Screenshots are kept outside this repository in the original study workspace. These checks verify browser behavior and the bank’s structure, not an independent peer review of every technical explanation or a test of a hosted Vercel deployment.

## iPhone Home Screen follow-up

Added a relative-scope standalone manifest, 180px Apple touch icon, 192/512px manifest icons, iOS launch metadata, safe-area insets, larger mobile text and touch controls, and a versioned service worker that caches the 11 required application assets. The service worker does not force a version switch during an existing session.

Verified in fresh Chromium contexts with mobile viewport, touch, and high pixel density emulation:

- No horizontal overflow at 320×568, 375×667, 390×844, 430×932, or 844×390 (landscape).
- Primary navigation, study-mode controls, session-length controls, select, and start button measure at least 44px high; select and answer input text measure at least 16px.
- Multiple-choice selection, bookmark, answer checking, and blank input work with touch actions.
- A draft survives reload and resume. After disabling the network, the app reloads from its service-worker cache and grades a blank answer correctly.
- Answered multiple-choice feedback and its bookmark survive an offline reload and resume.
- All 11 required files were cached, and the manifest declares standalone display. PNG icons were generated and visually inspected.
- Visually inspected the mobile home and feedback screenshots. No JavaScript page errors were captured during the fresh-context checks.

Actual iOS Safari, the on-screen iPhone keyboard, safe-area dimensions supplied by iOS, and the operating system’s Add to Home Screen flow were not available to test on physical hardware. These remain a device verification step after HTTPS deployment. Setup instructions are in `README.md`.

## Requirements classification expansion

Added 18 questions based on the supplied functional / non-functional / high-level architecture table: 12 multiple-choice and six blanks. The bank now has 138 questions (87 choice / 51 blank); the foundations topic has 26 questions.

- Bank inventory and JavaScript syntax checks passed.
- Compared every original question object against the previous Git commit: all 120 original IDs, prompts, answers, choices, and explanations are unchanged. The saved-data version remains 1.
- Completed all 26 foundations questions through a fresh 390×844 touch-emulated browser context. All 18 new questions appeared, accepted their correct answers or aliases, and displayed feedback without horizontal overflow or JavaScript errors.
- Seeded earlier progress and a bookmark before the session; both survived the update, and the completed-session count increased correctly.
- Disabled the network and reloaded: the updated 138-question bank loaded from the v3 offline cache, and the visible format totals were 87 choice / 51 blank.

These are local browser-emulation checks, not a physical iPhone test.

## Developer fundamentals expansion — October 26, 2026

Added 45 questions: 15 each for React, Next.js, and Node.js & JavaScript. The bank now contains 183 questions across 18 topics: 117 multiple-choice and 66 blanks. Each new question includes a primary-documentation link; the reference inventory is in SOURCES.md.

- Bank inventory, source-domain checks, JavaScript syntax, and Git whitespace checks passed.
- Compared all 138 prior question objects and 15 prior topic records against the previous commit: unchanged. The stored-data version remains 1.
- In a fresh 390×844 touch-emulated browser, resumed an old one-question session, then completed all 45 new questions. All correct choices and blank aliases were accepted, and the final score was 45/45.
- All 45 feedback references and all 45 answer-review references matched the corresponding authored URL. Links open separately and carry noopener/noreferrer.
- No horizontal overflow or JavaScript page errors occurred during the complete mobile session. Visually reviewed the new question and source-link presentation. Documentation links have mobile touch spacing.
- Earlier answer history, bookmarks, and completed-session count remained intact.
- After disabling the network and reloading, the v4 cache supplied the 183-question bank and all 18 topics; selecting Next.js created its full 15-question session offline.

These checks use Chromium mobile emulation, not physical iPhone Safari. Primary references were checked on October 26, 2026; Next.js material specifies the App Router and avoids universal claims about version-dependent cache defaults.

## Interface copy cleanup — October 26, 2026

Removed introductory paragraphs, slogans, general-use instructions, keyboard hints, motivational feedback, and repeated screen descriptions across the interface. Kept concise labels, actual status/error messages, question explanations/references, topic scope descriptions, scoring labels, and the reset confirmation. The full coverage grid remains on Progress; home shows compact question-bank totals. Offline shell version is v6.

Verified home at 320, 390, 844, and 1440 pixel widths without horizontal overflow. In a 390×844 touch-emulated browser, checked Topics, Progress, reset/cancel, ten blank questions (nine correct and one revealed), feedback, results, answer review, and offline reload. Removed phrases were absent across these screens. Grading remained 9/10, answer explanations remained visible, all 18 topics remained available, and no JavaScript page errors were captured. Bank validation still reports 183 questions. These checks are local browser emulation.

## Stale localhost preview fix — October 26, 2026

Disabled offline worker registration on localhost, 127.0.0.1, and IPv6 loopback. Local startup unregisters only a worker matching this app’s sw.js and removes only its prefixed file caches. It does not access localStorage or clear quiz progress. Production HTTPS registration is unchanged; its shell version is v7.

Verified the environment branches with isolated JavaScript contexts: all three loopback hosts clean the quiz cache/worker without touching unrelated caches/workers, production still registers its worker without clearing caches, and any localStorage access would fail the test. Bank check still reports 183 questions. In the user’s Chrome, two local tabs both visibly showed the original intro; refreshed their worker update, navigated both away, and reopened them. Both then showed Session and the compact question-bank summary with the removed copy absent.

## Production cache retirement — October 26, 2026

Removed offline caching entirely at the user’s request. sw.js is now a retirement worker with skipWaiting, no fetch handler, cleanup limited to quiz-prefixed file caches, self-unregistration, and navigation of app clients to the network version. pwa.js never registers a worker; it removes remaining quiz registrations/file caches. No code clears localStorage. Added Vercel browser/CDN no-store headers, release query strings on CSS/JS, and a /latest rewrite that bypasses older workers’ root/index navigation cache.

Tested migration using a separate local origin and the exact initial Git release (fd2974f): created two mobile-emulated tabs controlled by its v2 worker, confirmed both displayed the 120-question introductory UI, and seeded prior history/bookmarks. Replaced the served files with the new release and refreshed one tab. Both open tabs automatically navigated to the 183-question Session screen; quiz registrations and quiz-prefixed caches were absent afterward. Seeded answer history, bookmarks, completed-session count, and an unrelated cache all remained intact. The /latest recovery path, quiz start, save/exit, and subsequent reload also worked. Bank and JS syntax checks passed. Test server simulates the /latest rewrite; the production rewrite and response headers are defined in vercel.json.

The app is now online-only. Home Screen metadata and local progress remain, but offline launch is intentionally no longer supported. Physical iPhone behavior cannot be verified from this computer.

## October 30, 2026 — time and space complexity

- 213 questions, 19 topics, 135 multiple choice and 78 blanks pass `node check-bank.cjs`.
- The original 183 questions and 18 topic objects compare equal to the prior bank; data version remains 1.
- All 17 JavaScript snippets parse. Code is escaped in the question and review views.
- Completed all 30 new questions in a 375px browser: correct answers graded 30/30; a subsequent revised exponential branching example passed separately.
- Full Big O answers tolerate whitespace/case and listed exponent aliases; `o ( n² )`, `o( log   n )`, and `O( n + m )` passed. Incorrect `O(n^2)` for a linear fixed-inner-loop example was rejected.
- Save, reload and resume passed during the session. Results review contains all 17 code blocks.
- No page overflow at 375px during every question or at 320, 390, 667 and 1280px in answer review; no JavaScript page errors.
- Physical iPhone testing was not available. Existing online-only cleanup and Vercel no-store headers remain in place.
