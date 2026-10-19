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
