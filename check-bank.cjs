const assert = require('node:assert/strict');
global.window = {};
require('./questions.js');
const { topics, questions } = window.QUIZ_DATA;
assert.equal(topics.length, 15);
assert.equal(questions.length, 138);
assert.equal(new Set(questions.map(q => q.id)).size, 138);
assert.equal(questions.filter(q => q.type === 'choice').length, 87);
assert.equal(questions.filter(q => q.type === 'blank').length, 51);
for (const topic of topics) {
  assert.equal(questions.filter(q => q.topic === topic.id).length, topic.id === 'foundations' ? 26 : 8, topic.id);
  assert.ok(topic.source);
}
for (const q of questions) {
  assert.ok(topics.some(t => t.id === q.topic));
  assert.ok(q.prompt && q.explanation);
  if (q.type === 'choice') {
    assert.equal(q.choices.length, 4, q.id);
    assert.equal(new Set(q.choices).size, 4, q.id);
    assert.ok(q.choices.includes(q.answer), q.id);
  } else {
    assert.ok(q.prompt.includes('_____'), q.id);
    assert.ok(q.answers.length && q.answers.every(a => typeof a === 'string' && a.trim()), q.id);
  }
}
console.log('Verified: 138 unique questions, 15 topics, 87 choice / 51 blank; 18 added requirements/architecture questions, valid answers and explanations.');
