import chai from 'chai';
import { IntentResolverManager, SimpleIntentResolver } from '../../src/intentsResolver';
import { InputExpressionTokenizer, ComplexeTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

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
      { lang: 'fr', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('Hello'), input: 'Hello' },
      { lang: 'fr', topic: '*', intentid: 2, tokenizedInput: tokenizerInput.tokenize('Bye'), input: 'Bye' },
      { lang: 'fr', topic: '*', intentid: 3, tokenizedInput: tokenizerInput.tokenize('{{*}}'), input: '{{*}}' },
    ]);

    const result = resolverManager.processBest('fr', tokenizerUtterance.tokenize('Bye'));
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);
  });

  it('Should process all sub-intentResolver with filter using LANG', () => {
    const resolverManager = new IntentResolverManager({});
    resolverManager.train([
      { lang: 'fr', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('Hello'), input: 'Hello' },
      { lang: 'fr', topic: '*', intentid: 2, tokenizedInput: tokenizerInput.tokenize('Bye'), input: 'Bye' },
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

  it('Should process all sub-intentResolver with filter using LANG & TOPIC', () => {
    const resolverManager = new IntentResolverManager({});
    resolverManager.train([
      { lang: 'fr', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('Hello'), input: 'Hello' },
      {
        lang: 'fr',
        topic: 'anOtherDomain',
        intentid: 2,
        tokenizedInput: tokenizerInput.tokenize('Hello'),
        input: 'Hello',
      },
      { lang: 'fr', topic: '*', intentid: 3, tokenizedInput: tokenizerInput.tokenize('Bye'), input: 'Bye' },
    ]);

    // First test topic is *
    let result = resolverManager.processBest('fr', tokenizerUtterance.tokenize('Hello'), { topic: '*' });
    // Intent 'Hello' (topic = *) -> match
    expect(result[0].intentid).to.equal(1);
    expect(result[0].score).to.equal(1);

    // Seconde test topic is 'anOtherDomain'
    result = resolverManager.processBest('fr', tokenizerUtterance.tokenize('Hello'), { topic: 'anOtherDomain' });
    // Intent 'Hello' (topic = anOtherDomain) -> match
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);

    // Third test topic is 'anOtherDomain' but match main domain (*)
    result = resolverManager.processBest('fr', tokenizerUtterance.tokenize('Bye'), { topic: 'anOtherDomain' });
    // Intent 'Hello' (topic = *) -> match
    expect(result[0].intentid).to.equal(3);
    expect(result[0].score).to.equal(1);
    // Topic change in this case
    expect(result[0].context.topic).to.equal('*');
  });

  it('Should process with previous (input intent condition)', () => {
    const resolverManager = new IntentResolverManager({});
    resolverManager.train([
      { lang: 'fr', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('nogard'), input: 'nogard' },
      {
        lang: 'fr',
        topic: '*',
        previous: [1],
        intentid: 2,
        tokenizedInput: tokenizerInput.tokenize('dragon'),
        input: 'dragon',
      },
    ]);

    let result = resolverManager.processBest('fr', tokenizerUtterance.tokenize('dragon'), {});
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(0.1);

    result = resolverManager.processBest('fr', tokenizerUtterance.tokenize('dragon'), { previous: 1 });
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);
  });

  it('Should custom intentResolvers using settings', () => {
    const resolverManager = new IntentResolverManager({
      settings: { intentResolvers: [new SimpleIntentResolver({})] },
    });
    expect(resolverManager.intentResolvers.length).to.equal(1);
  });
});
