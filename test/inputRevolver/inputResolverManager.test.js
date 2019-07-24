const chai = require('chai');

const { expect } = chai;

const { IntentResolverManager, SimpleIntentResolver } = require('../../src/intentsResolver');

const { InputExpressionTokenizer } = require('../../src/streamTransformers');

const { ComplexeTokenizer } = require('../../src/streamTransformers');

const tokenizerInput = new InputExpressionTokenizer();
const tokenizerUtterance = ComplexeTokenizer;

describe('IntentResolverManager', () => {
  it('Should train all sub-intentResolver ', () => {
    const resolverManager = new IntentResolverManager({});
    resolverManager.train([1]);

    expect(resolverManager.intentResolvers[0].inputs.length).to.equal(1);
  });

  it('Should processBests from all sub-intentResolver with filter using LANG', () => {
    const resolverManager = new IntentResolverManager({});
    resolverManager.train([
      { lang: 'fr', intentid: 1, tokenizedInput: tokenizerInput.tokenize('Hello'), input: 'Hello' },
      { lang: 'fr', intentid: 2, tokenizedInput: tokenizerInput.tokenize('Bye'), input: 'Bye' },
      { lang: 'fr', intentid: 3, tokenizedInput: tokenizerInput.tokenize('*'), input: '*' },
    ]);

    const result = resolverManager.processBest('fr', tokenizerUtterance.tokenize('Bye'));
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);
  });

  it('Should process all sub-intentResolver with filter using LANG', () => {
    const resolverManager = new IntentResolverManager({});
    resolverManager.train([
      { lang: 'fr', intentid: 1, tokenizedInput: tokenizerInput.tokenize('Hello'), input: 'Hello' },
      { lang: 'fr', intentid: 2, tokenizedInput: tokenizerInput.tokenize('Bye'), input: 'Bye' },
    ]);

    const result = resolverManager.process('fr', tokenizerUtterance.tokenize('Bye'));
    expect(result.length).to.equal(2);
    // Intent 'Bye' -> match
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);
    // Intent 'Hello' -> no match
    expect(result[1].intentid).to.equal(1);
    expect(result[1].score).to.equal(0);
  });

  it('Should custom intentResolvers using settings', () => {
    const resolverManager = new IntentResolverManager({
      settings: { intentResolvers: [new SimpleIntentResolver({})] },
    });
    expect(resolverManager.intentResolvers.length).to.equal(1);
  });
});
