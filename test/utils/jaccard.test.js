const chai = require('chai');

const { expect } = chai;

const jaccardDistance = require('../../src/utils/comparator/jaccard');

const { InputExpressionTokenizer, ComplexeTokenizer } = require('../../src/streamTransformers');

const tokenizerInput = new InputExpressionTokenizer();
const tokenizerUtterance = ComplexeTokenizer;

describe('Jaccard distance', () => {
  const a = tokenizerInput.tokenize('one two three four');
  it('Jaccard distance - Same A & B', () => {
    const b = tokenizerUtterance.tokenize('one two three four');
    const result = jaccardDistance(a, b);
    expect(result.distance).to.equal(0);
    expect(result.score).to.equal(1);
  });

  it('Jaccard distance - A inter B = 3', () => {
    const b = tokenizerUtterance.tokenize('one two three');
    const result = jaccardDistance(a, b);
    expect(result.distance).to.equal(0.25);
  });

  it('Jaccard distance - A inter B = 2', () => {
    const b = tokenizerUtterance.tokenize('one two');
    const result = jaccardDistance(a, b);
    expect(result.distance).to.equal(0.5);
  });

  it('Jaccard distance - A inter B = 1', () => {
    const b = tokenizerUtterance.tokenize('one');
    const result = jaccardDistance(a, b);
    expect(result.distance).to.equal(0.75);
  });

  it('Jaccard distance - A inter B = 0', () => {
    const b = tokenizerUtterance.tokenize('');
    const result = jaccardDistance(a, b);
    expect(result.distance).to.equal(1.0);
    expect(result.score).to.equal(0);
  });

  it('Jaccard distance - Entities', () => {
    const b = tokenizerUtterance.tokenize('');
    const result = jaccardDistance(a, b);
    expect(result.distance).to.equal(1.0);
    expect(result.score).to.equal(0);
  });
});
