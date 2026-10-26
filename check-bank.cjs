const assert = require('node:assert/strict');
global.window = {};
require('./questions.js');
const { topics, questions } = window.QUIZ_DATA;
assert.equal(topics.length, 18);
assert.equal(questions.length, 183);
assert.equal(new Set(questions.map(q => q.id)).size, 183);
assert.equal(questions.filter(q => q.type === 'choice').length, 117);
assert.equal(questions.filter(q => q.type === 'blank').length, 66);
for (const topic of topics) {
  assert.equal(questions.filter(q => q.topic === topic.id).length, topic.id === 'foundations' ? 26 : ['react', 'nextjs', 'nodejs'].includes(topic.id) ? 15 : 8, topic.id);
  assert.ok(topic.source);
}
for (const q of questions) {
  assert.ok(topics.some(t => t.id === q.topic));
  assert.ok(q.prompt && q.explanation);
  if (['react', 'nextjs', 'nodejs'].includes(q.topic)) {
    assert.ok(q.sourceUrl, q.id);
    const source = new URL(q.sourceUrl);
    assert.equal(source.protocol, 'https:');
    assert.ok(['react.dev', 'nextjs.org', 'nodejs.org', 'developer.mozilla.org'].includes(source.hostname));
  }
  if (q.type === 'choice') {
    assert.equal(q.choices.length, 4, q.id);
    assert.equal(new Set(q.choices).size, 4, q.id);
    assert.ok(q.choices.includes(q.answer), q.id);
  } else {
    assert.ok(q.prompt.includes('_____'), q.id);
    assert.ok(q.answers.length && q.answers.every(a => typeof a === 'string' && a.trim()), q.id);
  }
}
console.log('Verified: 183 unique questions, 18 topics, 117 choice / 66 blank; 45 sourced React/Next.js/Node.js questions, valid answers and explanations.');
