const assert = require('node:assert/strict');
global.window = {};
require('./questions.js');
const { topics, questions } = window.QUIZ_DATA;
assert.equal(topics.length, 15);
assert.equal(questions.length, 120);
assert.equal(new Set(questions.map(q => q.id)).size, 120);
assert.equal(questions.filter(q => q.type === 'choice').length, 75);
assert.equal(questions.filter(q => q.type === 'blank').length, 45);
for (const topic of topics) {
  assert.equal(questions.filter(q => q.topic === topic.id).length, 8, topic.id);
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
console.log('Verified: 120 unique questions, 15 balanced topics, 75 choice / 45 blank, valid answers and explanations.');
