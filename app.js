(() => {
  'use strict';
  const { topics, questions, version } = window.QUIZ_DATA;
  const choiceCount = questions.filter(q => q.type === 'choice').length;
  const blankCount = questions.filter(q => q.type === 'blank').length;
  const byId = new Map(questions.map(q => [q.id, q]));
  const topicById = new Map(topics.map(t => [t.id, t]));
  const KEY = 'systems-after-hours-v1';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[.!?]+$/, '').replace(/[\s_-]+/g, ' ');
  const shuffle = values => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const empty = () => ({ version, history: {}, bookmarks: [], session: null, completed: 0 });
  let data = empty();
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.version === version && saved.history && Array.isArray(saved.bookmarks)) {
      data = { ...empty(), ...saved };
      data.bookmarks = data.bookmarks.filter(id => byId.has(id));
      // Recover known data only; discard sessions incompatible with an edited bank.
      if (data.session && (!Array.isArray(data.session.ids) || !data.session.ids.length || !data.session.ids.every(id => byId.has(id)) || !Array.isArray(data.session.results) || !data.session.orders || !Number.isInteger(data.session.index) || data.session.index < 0 || data.session.index >= data.session.ids.length)) data.session = null;
      for (const [id, h] of Object.entries(data.history)) {
        if (!byId.has(id) || !h || !Number.isFinite(h.attempts) || !Number.isFinite(h.correct)) delete data.history[id];
      }
    }
  } catch { storageAvailable = false; }
  let view = 'study';
  let config = { topics: topics.map(t => t.id), mode: 'all', type: 'mixed', length: 20 };
  let active = false;
  let showReview = false;
  let noticeTimer;
  const stats = () => {
    const history = Object.values(data.history);
    const attempts = history.reduce((n, h) => n + h.attempts, 0);
    return { seen: history.length, learned: history.filter(h => h.lastCorrect).length, missed: history.filter(h => !h.lastCorrect).length, attempts, accuracy: attempts ? Math.round(history.reduce((n, h) => n + h.correct, 0) / attempts * 100) : 0 };
  };
  function notify(message) {
    $('#notice').textContent = message;
    $('#notice').hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { $('#notice').hidden = true; }, 4500);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); storageAvailable = true; }
    catch { storageAvailable = false; notify('Browser storage is unavailable. This session works, but progress may not survive closing the page.'); }
  }
  function pool() {
    return questions.filter(q => config.topics.includes(q.topic) && (config.type === 'mixed' || q.type === config.type) && (config.mode === 'all' || config.mode === 'missed' && data.history[q.id] && !data.history[q.id].lastCorrect || config.mode === 'saved' && data.bookmarks.includes(q.id)));
  }
  const countFor = t => questions.filter(q => q.topic === t).length;
  const learnedFor = t => questions.filter(q => q.topic === t && data.history[q.id]?.lastCorrect).length;
  function coverageMap() {
    return `<div class="coverage-map" aria-hidden="true">${questions.map(q => `<i class="${data.history[q.id]?.lastCorrect ? 'learned' : data.history[q.id] ? 'seen' : ''}"></i>`).join('')}</div>`;
  }
  function sidebar() {
    $('.sidebar').classList.toggle('in-session', active);
    document.querySelectorAll('[data-view]').forEach(el => { el.classList.toggle('active', el.dataset.view === view); el.setAttribute('aria-current', el.dataset.view === view ? 'page' : 'false'); });
    $('#topic-nav').innerHTML = `<button class="topic-item ${config.topics.length === topics.length ? 'selected' : ''}" data-topic="all"><span class="topic-index">∞</span><span>All topics</span><span class="topic-total">${questions.length}</span></button>${topics.map((t, i) => `<button class="topic-item ${config.topics.length === 1 && config.topics[0] === t.id ? 'selected' : ''}" data-topic="${t.id}"><span class="topic-index">${String(i + 1).padStart(2, '0')}</span><span>${esc(t.name)}</span><span class="topic-total">${learnedFor(t.id)}/${countFor(t.id)}</span></button>`).join('')}`;
  }
  function render(focus = false) {
    sidebar();
    $('#main').className = active ? 'session-main' : '';
    if (active) renderQuestion();
    else if (view === 'topics') renderTopics();
    else if (view === 'progress') renderProgress();
    else renderStudy();
    if (focus) { $('#main').focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
  function renderStudy() {
    const s = stats();
    const available = pool().length;
    const amount = Math.min(available, config.length || available);
    const current = data.session;
    $('#main').innerHTML = `${current ? `<div class="resume-banner"><div><strong>Saved session</strong><span>${current.results.length} of ${current.ids.length} answered.</span></div><button class="secondary" id="resume">Resume <span aria-hidden="true">↗</span></button></div>` : ''}
      <div class="study-grid"><section class="panel setup-panel"><h1 class="setup-title">Session</h1>
      <div class="control-group"><span class="field-label" id="mode-label">Practice</span><div class="segmented" role="group" aria-labelledby="mode-label">${[['all','Everything'],['missed',`Missed · ${s.missed}`],['saved',`Saved · ${data.bookmarks.length}`]].map(([id,label]) => `<button data-mode="${id}" aria-pressed="${config.mode === id}">${label}</button>`).join('')}</div></div>
      <div class="control-group"><span class="field-label" id="length-label">Session length</span><div class="length-options" role="group" aria-labelledby="length-label">${[10,20,40,0].map(n => `<button data-length="${n}" aria-pressed="${config.length === n}"><strong>${n || 'All'}</strong><span>${n ? 'questions' : 'available'}</span></button>`).join('')}</div></div>
      <div class="form-row"><label class="field-label" for="question-type">Question format</label><select id="question-type"><option value="mixed" ${config.type === 'mixed' ? 'selected' : ''}>Both formats</option><option value="choice" ${config.type === 'choice' ? 'selected' : ''}>Multiple choice</option><option value="blank" ${config.type === 'blank' ? 'selected' : ''}>Fill in the blank</option></select></div>
      <details class="topic-picker"><summary>Topics <span>${config.topics.length === topics.length ? `All ${topics.length} selected` : `${config.topics.length} selected`}</span></summary><div class="picker-actions"><button class="text-button" data-select-topics="all">Select all</button><button class="text-button" data-select-topics="none">Clear</button></div><div class="topic-checks">${topics.map(t => `<label><input type="checkbox" data-topic-check="${t.id}" ${config.topics.includes(t.id) ? 'checked' : ''}>${esc(t.name)}</label>`).join('')}</div></details>
      <div class="start-area"><button id="start" class="primary" ${amount ? '' : 'disabled'}>Begin session <span aria-hidden="true">↗</span></button><span id="pool-info">${amount ? `${amount} questions` : config.topics.length ? 'No matching questions.' : 'Select a topic.'}</span></div>
      ${current ? '<p class="small muted">New session replaces the saved session.</p>' : ''}</section>
      <aside class="study-overview"><section class="panel coverage-panel"><div class="panel-heading"><h2>Question bank</h2></div><div class="coverage-number">${questions.length}<span>questions</span></div><div class="map-legend"><span><i class="legend-dot learned"></i>${s.learned} correct on last try</span><span>${questions.length - s.seen} unexplored</span></div><div class="coverage-footer"><span>${topics.length} topics</span><span>${choiceCount} multiple choice</span><span>${blankCount} fill in the blank</span></div></section>
      </aside></div>
`;
  }
  function startSession(ids) {
    const eligible = ids ? ids.map(id => byId.get(id)).filter(Boolean) : pool();
    if (!eligible.length) return;
    const selected = shuffle(eligible).slice(0, ids ? eligible.length : config.length || eligible.length);
    data.session = { ids: selected.map(q => q.id), orders: Object.fromEntries(selected.filter(q => q.type === 'choice').map(q => [q.id, shuffle(q.choices)])), index: 0, results: [], choice: null, text: '' };
    active = true; view = 'study'; showReview = false; save(); render(true);
  }
  function sourceMarkup(q) {
    const label = q.sourceUrl ? 'Documentation' : esc(topicById.get(q.topic).source);
    return `<span class="source">Reference · ${q.sourceUrl ? `<a href="${esc(q.sourceUrl)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>` : label}</span>`;
  }
  function currentResult() { return data.session?.results.find(r => r.id === data.session.ids[data.session.index]); }
  function renderQuestion() {
    const session = data.session;
    if (!session) { active = false; return render(); }
    const q = byId.get(session.ids[session.index]);
    const result = currentResult();
    const saved = data.bookmarks.includes(q.id);
    const correctAnswer = q.type === 'choice' ? q.answer : q.answers[0];
    const order = session.orders[q.id] || q.choices;
    $('#main').innerHTML = `<div class="session-toolbar"><button class="text-button" id="save-exit">← Save & exit</button><span class="session-count">${session.index + 1} <span>/ ${session.ids.length}</span></span></div><div class="progress-track" role="progressbar" aria-label="Questions answered" aria-valuenow="${session.results.length}" aria-valuemin="0" aria-valuemax="${session.ids.length}"><i style="width:${session.results.length / session.ids.length * 100}%"></i></div>
      <article class="question-panel"><div class="question-meta"><span class="topic-tag">${esc(topicById.get(q.topic).name)}</span><button id="bookmark" class="bookmark ${saved ? 'is-saved' : ''}" aria-pressed="${saved}" aria-label="${saved ? 'Unsave question' : 'Save question'}"><span aria-hidden="true">${saved ? '◆' : '◇'}</span> ${saved ? 'Saved' : 'Save question'}</button></div><div class="eyebrow question-type">${q.type === 'choice' ? 'MULTIPLE CHOICE' : 'FILL IN THE BLANK'}</div><h1 id="question-title">${esc(q.prompt)}</h1>
      <form id="answer-form"><fieldset ${result ? 'disabled' : ''}><legend class="sr-only">${esc(q.prompt)}</legend>${q.type === 'choice' ? `<div class="choices">${order.map((choice, i) => `<label class="choice ${result && choice === q.answer ? 'correct' : result && choice === result.answer && !result.correct ? 'incorrect' : ''}"><input type="radio" name="answer" value="${esc(choice)}" ${session.choice === choice ? 'checked' : ''}><span class="choice-key">${String.fromCharCode(65 + i)}</span><span>${esc(choice)}</span>${result && choice === q.answer ? '<span class="choice-outcome">✓</span>' : ''}</label>`).join('')}</div>` : `<label class="field-label blank-label" for="blank-answer">Your answer</label><input id="blank-answer" class="blank-input" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(session.text)}">`}</fieldset>
      ${result ? `<section class="feedback ${result.correct ? 'positive' : 'negative'}" aria-live="polite"><div class="feedback-heading">${result.correct ? '✓ Correct' : result.revealed ? 'Revealed' : 'Incorrect'}</div>${result.correct ? '' : `<p class="answer-line">Answer: <strong>${esc(correctAnswer)}</strong></p>`}<p>${esc(q.explanation)}</p>${sourceMarkup(q)}</section>` : ''}
      <div class="question-actions">${result ? `<span class="small muted">${session.results.filter(r => r.correct).length} correct so far</span><button type="button" id="next" class="primary">${session.index === session.ids.length - 1 ? 'See results' : 'Next question'} <span aria-hidden="true">→</span></button>` : `<button type="button" id="reveal" class="text-button">Reveal answer</button><button id="check" class="primary" type="submit" ${q.type === 'choice' ? session.choice === null ? 'disabled' : '' : session.text.trim() ? '' : 'disabled'}>Check answer <span aria-hidden="true">→</span></button>`}</div></form></article>
`;
    if (result) $('#next').focus({ preventScroll: true });
  }
  function grade(revealed) {
    const session = data.session;
    if (!session || currentResult()) return;
    const q = byId.get(session.ids[session.index]);
    const answer = q.type === 'choice' ? session.choice : session.text;
    if (!revealed && (!answer || !answer.trim())) return;
    const correct = !revealed && (q.type === 'choice' ? answer === q.answer : q.answers.some(a => normalize(a) === normalize(answer)));
    session.results.push({ id: q.id, answer: answer || '', correct, revealed });
    const h = data.history[q.id] || { attempts: 0, correct: 0 };
    data.history[q.id] = { attempts: h.attempts + 1, correct: h.correct + Number(correct), lastCorrect: correct };
    save(); render();
  }
  function next() {
    const session = data.session;
    if (!session || !currentResult()) return;
    if (session.index + 1 < session.ids.length) { session.index++; session.choice = null; session.text = ''; save(); render(true); }
    else finish();
  }
  function finish() {
    const results = [...data.session.results];
    data.session = null; data.completed++; save(); active = false; sidebar();
    $('#main').className = '';
    const correct = results.filter(r => r.correct).length;
    const missed = results.filter(r => !r.correct).map(r => r.id);
    $('#main').innerHTML = `<section class="results-header"><h1>Results</h1><div class="score">${correct}<span>/ ${results.length}</span></div><span class="score-label">correct answers · ${Math.round(correct / results.length * 100)}% accuracy</span></section><section class="panel results-panel"><div class="panel-heading"><h2>By topic</h2><span class="pill">${results.length} questions</span></div>${topics.filter(t => results.some(r => byId.get(r.id).topic === t.id)).map(t => { const rows = results.filter(r => byId.get(r.id).topic === t.id); return `<div class="result-topic"><span>${esc(t.name)}</span><span>${rows.filter(r => r.correct).length} / ${rows.length}</span></div>`; }).join('')}<div class="result-buttons">${missed.length ? `<button id="retry-missed" class="primary">Revisit ${missed.length} missed <span aria-hidden="true">↗</span></button>` : ''}<button id="new-session" class="secondary">New session</button><button id="review-session" class="text-button">Review answers ↓</button></div></section><div id="session-review" hidden>${results.map(r => { const q = byId.get(r.id); return `<article class="panel review-item"><span class="eyebrow ${r.correct ? 'success-text' : 'warm-text'}">${r.correct ? 'CORRECT' : r.revealed ? 'REVEALED' : 'TO REVISIT'}</span><h3>${esc(q.prompt)}</h3><p class="small">Your answer: ${r.revealed ? 'Answer revealed' : esc(r.answer)}</p><p>Answer: <strong>${esc(q.type === 'choice' ? q.answer : q.answers[0])}</strong></p><p class="muted">${esc(q.explanation)}</p>${sourceMarkup(q)}<button class="text-button" data-review-bookmark="${q.id}" aria-pressed="${data.bookmarks.includes(q.id)}">${data.bookmarks.includes(q.id) ? '◆ Saved' : '◇ Save question'}</button></article>`; }).join('')}</div>`;
    $('#retry-missed')?.addEventListener('click', () => startSession(missed));
    $('#review-session').addEventListener('click', () => { showReview = !showReview; $('#session-review').hidden = !showReview; $('#review-session').textContent = showReview ? 'Hide answers ↑' : 'Review answers ↓'; });
    $('#main').focus(); window.scrollTo(0, 0);
  }
  function renderTopics() {
    $('#main').innerHTML = `<header class="page-heading"><h1>Topics</h1><span>${topics.length}</span></header><div class="topics-grid">${topics.map((t, i) => `<button class="panel topic-card" data-topic="${t.id}"><span class="topic-card-top"><span class="eyebrow">${String(i + 1).padStart(2, '0')}</span><span aria-hidden="true">↗</span></span><h2>${esc(t.name)}</h2><p>${esc(t.description)}</p><div class="topic-card-progress"><i style="width:${learnedFor(t.id) / countFor(t.id) * 100}%"></i></div><span class="small muted">${learnedFor(t.id)} of ${countFor(t.id)} correct on last try</span></button>`).join('')}</div>`;
  }
  function renderProgress() {
    const s = stats();
    $('#main').innerHTML = `<header class="page-heading"><h1>Progress</h1></header><section class="panel progress-panel"><div class="progress-stats"><div><strong>${s.seen}<span>/${questions.length}</span></strong><span>Questions explored</span></div><div><strong>${s.attempts ? `${s.accuracy}%` : '—'}</strong><span>All-time accuracy</span></div><div><strong>${data.completed}</strong><span>Sessions completed</span></div></div>${coverageMap()}<div class="map-legend"><span><i class="legend-dot learned"></i>Correct on last try · ${s.learned}</span><span><i class="legend-dot seen"></i>To revisit · ${s.missed}</span><span><i class="legend-dot"></i>Unexplored · ${questions.length - s.seen}</span></div></section><div class="progress-table"><div class="table-heading"><span>TOPIC</span><span>EXPLORED</span><span>CORRECT ON LAST TRY</span></div>${topics.map(t => `<div class="table-row"><span>${esc(t.name)}</span><span>${questions.filter(q => q.topic === t.id && data.history[q.id]).length} / ${countFor(t.id)}</span><span><i class="mini-bar"><b style="width:${learnedFor(t.id) / countFor(t.id) * 100}%"></b></i>${learnedFor(t.id)} / ${countFor(t.id)}</span></div>`).join('')}</div><footer class="page-footer"><button id="reset" class="text-button">Reset progress</button></footer>`;
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.view) { active = false; view = button.dataset.view; render(true); }
    else if (button.dataset.topic) { active = false; config.topics = button.dataset.topic === 'all' ? topics.map(t => t.id) : [button.dataset.topic]; view = 'study'; render(true); }
    else if (button.dataset.mode) { config.mode = button.dataset.mode; render(); $(`[data-mode="${config.mode}"]`).focus({ preventScroll: true }); }
    else if (button.dataset.length !== undefined) { config.length = Number(button.dataset.length); render(); $(`[data-length="${config.length}"]`).focus({ preventScroll: true }); }
    else if (button.dataset.selectTopics) { const selection = button.dataset.selectTopics; config.topics = selection === 'all' ? topics.map(t => t.id) : []; render(); $('.topic-picker').open = true; $(`[data-select-topics="${selection}"]`).focus({ preventScroll: true }); }
    else if (button.id === 'start') startSession();
    else if (button.id === 'resume') { active = true; render(true); }
    else if (button.id === 'save-exit') { active = false; view = 'study'; save(); render(true); }
    else if (button.id === 'reveal') grade(true);
    else if (button.id === 'next') next();
    else if (button.id === 'new-session') { view = 'study'; render(true); }
    else if (button.id === 'bookmark' || button.dataset.reviewBookmark) {
      const id = button.dataset.reviewBookmark || data.session.ids[data.session.index];
      const isSaved = data.bookmarks.includes(id);
      data.bookmarks = isSaved ? data.bookmarks.filter(x => x !== id) : [...data.bookmarks, id];
      save();
      if (button.id === 'bookmark') { render(); $('#bookmark').focus({ preventScroll: true }); }
      else { button.textContent = isSaved ? '◇ Save question' : '◆ Saved'; button.setAttribute('aria-pressed', String(!isSaved)); }
    }
    else if (button.id === 'reset') $('#reset-dialog').showModal();
    else if (button.id === 'cancel-reset') $('#reset-dialog').close();
    else if (button.id === 'confirm-reset') { data = empty(); save(); $('#reset-dialog').close(); render(); notify('Progress reset.'); }
  });
  $('.brand').addEventListener('click', e => { e.preventDefault(); active = false; view = 'study'; render(true); });
  document.addEventListener('change', e => {
    if (e.target.id === 'question-type') { config.type = e.target.value; render(); $('#question-type').focus(); }
    else if (e.target.dataset.topicCheck) { const id = e.target.dataset.topicCheck; config.topics = e.target.checked ? [...config.topics, id] : config.topics.filter(t => t !== id); render(); $('.topic-picker').open = true; $(`[data-topic-check="${id}"]`).focus(); }
    else if (e.target.name === 'answer') { data.session.choice = e.target.value; $('#check').disabled = false; save(); }
  });
  document.addEventListener('input', e => { if (e.target.id === 'blank-answer') { data.session.text = e.target.value; $('#check').disabled = !e.target.value.trim(); save(); } });
  document.addEventListener('submit', e => { if (e.target.id === 'answer-form') { e.preventDefault(); grade(false); } });
  document.addEventListener('keydown', e => {
    if (!active || e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
    const editable = ['TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.tagName === 'INPUT' && e.target.type !== 'radio';
    const result = currentResult();
    if (e.key === 'Enter' && result && ['main', 'next'].includes(e.target.id)) { e.preventDefault(); next(); }
    else if (e.key === 'Enter' && !result && (e.target.id === 'main' || e.target.name === 'answer' || e.target.id === 'blank-answer')) { e.preventDefault(); grade(false); }
    else if (!editable && !result && /^[1-4]$/.test(e.key)) {
      const input = document.querySelectorAll('input[name="answer"]')[Number(e.key) - 1];
      if (input) { e.preventDefault(); input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); input.focus(); }
    }
  });
  render();
  if (!storageAvailable) notify('Saved progress could not be loaded. Practice is available; browser storage may be restricted.');
})();
