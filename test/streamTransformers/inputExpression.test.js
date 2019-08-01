const chai = require('chai');

const { expect } = chai;

const { InputExpressionTokenizer } = require('../../src/streamTransformers');

describe('InputExpressionTokenizer', () => {
  const inputExpressionTokenizer = new InputExpressionTokenizer();
  it('Simple InputExpressionTokenization - without NLX syntax', () => {
    const input = 'Hello, I will be tokenized';

    const sentenceI = inputExpressionTokenizer.tokenize(input);
    const it = sentenceI.values();

    expect(it.next().value.text).to.equal('Hello');
    expect(it.next().value.text).to.equal('I');
    expect(it.next().value.text).to.equal('will');
    expect(it.next().value.text).to.equal('be');
    expect(it.next().value.text).to.equal('tokenized');
    expect(it.next().done).to.equal(true);
  });

  it('Simple InputExpressionTokenization - with NLX syntax', () => {
    const input = '{{^}} sometext {{*}}';

    const sentenceI = inputExpressionTokenizer.tokenize(input);
    const it = sentenceI.values();

    expect(it.next().value.expression.type).to.equal('ANYORNOTHING');
    expect(it.next().value.text).to.equal('sometext');
    expect(it.next().value.expression.type).to.equal('ANY');
    expect(it.next().done).to.equal(true);
  });

  it('Full InputExpressionTokenization - with NLX syntax', () => {
    const input = '{{variable=@email}} {{@email}}';

    const sentenceI = inputExpressionTokenizer.tokenize(input);
    const it = sentenceI.values();

    const firstNode = it.next().value.expression;
    expect(firstNode.type).to.equal('ENTITY');
    expect(firstNode.contextName).to.equal('variable');
    expect(firstNode.name).to.equal('email');

    const secondeNode = it.next().value.expression;
    expect(secondeNode.type).to.equal('ENTITY');
    expect(secondeNode.contextName).to.equal(undefined);
    expect(secondeNode.name).to.equal('email');

    expect(it.next().done).to.equal(true);
  });

  it('Full InputExpressionTokenization - wrong NLX syntax', () => {
    const input = '@email';

    const sentenceI = inputExpressionTokenizer.tokenize(input);
    const it = sentenceI.values();

    const firstNode = it.next().value.expression;
    expect(firstNode).to.equal(undefined);

    expect(it.next().done).to.equal(true);
  });
});
