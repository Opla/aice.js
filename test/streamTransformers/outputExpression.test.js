import chai from 'chai';
import { OutputExpressionTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

describe('OutputExpressionTokenizer', () => {
  const outputExpressionTokenizer = new OutputExpressionTokenizer();
  it('Simple OutputExpressionTokenizer - without NLX syntax', () => {
    const output = 'This is an output message';

    const tokenizedOutput = outputExpressionTokenizer.tokenize(output);
    const it = tokenizedOutput.values();

    expect(it.next().value.text).to.equal('This is an output message');
    expect(it.next().done).to.equal(true);
  });

  it('Simple OutputExpressionTokenizer - with special characters', () => {
    const output = 'This is a __special__ **message**';

    const tokenizedOutput = outputExpressionTokenizer.tokenize(output);
    const it = tokenizedOutput.values();

    expect(it.next().value.text).to.equal('This is a __special__ **message**');
    expect(it.next().done).to.equal(true);
  });

  it('Simple OutputExpressionTokenizer - with NLX syntax {{variable}}', () => {
    const input = '{{variable}}';

    const tokenizedOutput = outputExpressionTokenizer.tokenize(input);
    const it = tokenizedOutput.values();

    const firstNode = it.next().value.expression;
    expect(firstNode.type).to.equal('OUTPUT');
    expect(firstNode.contextName).to.equal('variable');

    expect(it.next().done).to.equal(true);
  });

  it('Simple OutputExpressionTokenizer - with NLX syntax {{variable=othervariable}}', () => {
    const input = '{{variable=othervariable}}';

    const tokenizedOutput = outputExpressionTokenizer.tokenize(input);
    const it = tokenizedOutput.values();

    const firstNode = it.next().value.expression;
    expect(firstNode.type).to.equal('OUTPUT');
    expect(firstNode.contextName).to.equal('variable');
    expect(firstNode.value.type).to.equal('VARIABLE');
    expect(firstNode.value.value).to.equal('othervariable');

    expect(it.next().done).to.equal(true);
  });

  it('Simple OutputExpressionTokenizer - with NLX syntax <<variable="some text">>', () => {
    const input = '<<variable="some text">>';

    const tokenizedOutput = outputExpressionTokenizer.tokenize(input);
    const it = tokenizedOutput.values();

    const firstNode = it.next().value.expression;
    expect(firstNode.type).to.equal('CODE');
    expect(firstNode.contextName).to.equal('variable');
    expect(firstNode.value).to.equal('some text');

    expect(it.next().done).to.equal(true);
  });
});
