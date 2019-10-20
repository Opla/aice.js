/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { IntentsResolverManager, SimpleIntentsResolver } from '../../src/intentsResolver';
import { InputExpressionTokenizer, AdvancedTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

const tokenizerInput = new InputExpressionTokenizer();
const tokenizerUtterance = AdvancedTokenizer;

describe('IntentsResolverManager', () => {
  it('Should train all sub-intentResolver ', () => {
    const resolverManager = new IntentsResolverManager({});
    resolverManager.train([1]);

    expect(resolverManager.intentResolvers[0].inputs.length).to.equal(1);
  });

  it('Should evaluate from all sub-intentResolver with filter using LANG', () => {
    const resolverManager = new IntentsResolverManager({});
    resolverManager.train([
      { lang: 'fr', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('Hello'), input: 'Hello' },
      { lang: 'fr', topic: '*', intentid: 2, tokenizedInput: tokenizerInput.tokenize('Bye'), input: 'Bye' },
      { lang: 'fr', topic: '*', intentid: 3, tokenizedInput: tokenizerInput.tokenize('{{*}}'), input: '{{*}}' },
    ]);

    const result = resolverManager.evaluate('fr', tokenizerUtterance.tokenize('Bye'));
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);
  });

  it('Should execute all sub-intentResolver with filter using LANG', () => {
    const resolverManager = new IntentsResolverManager({});
    resolverManager.train([
      { lang: 'fr', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('Hello'), input: 'Hello' },
      { lang: 'fr', topic: '*', intentid: 2, tokenizedInput: tokenizerInput.tokenize('Bye'), input: 'Bye' },
    ]);

    const result = resolverManager.execute('fr', tokenizerUtterance.tokenize('Bye'));
    expect(result.length).to.equal(2);
    // Intent 'Bye' -> match
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);
    // Intent 'Hello' -> no match
    expect(result[1].intentid).to.equal(1);
    expect(result[1].score).to.equal(0);
  });

  it('Should execute all sub-intentResolver with filter using LANG & TOPIC', () => {
    const resolverManager = new IntentsResolverManager({});
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
    let result = resolverManager.evaluate('fr', tokenizerUtterance.tokenize('Hello'), { topic: '*' });
    // Intent 'Hello' (topic = *) -> match
    expect(result[0].intentid).to.equal(1);
    expect(result[0].score).to.equal(1);

    // Seconde test topic is 'anOtherDomain'
    result = resolverManager.evaluate('fr', tokenizerUtterance.tokenize('Hello'), { topic: 'anOtherDomain' });
    // Intent 'Hello' (topic = anOtherDomain) -> match
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);

    // Third test topic is 'anOtherDomain' but match main domain (*)
    result = resolverManager.evaluate('fr', tokenizerUtterance.tokenize('Bye'), { topic: 'anOtherDomain' });
    // Intent 'Hello' (topic = *) -> match
    expect(result[0].intentid).to.equal(3);
    expect(result[0].score).to.equal(1);
    // Topic change in this case
    expect(result[0].context.topic).to.equal('*');
  });

  it('Should execute with previous (input intent condition)', () => {
    const resolverManager = new IntentsResolverManager({});
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

    let result = resolverManager.evaluate('fr', tokenizerUtterance.tokenize('dragon'), {});
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(0.1);

    result = resolverManager.evaluate('fr', tokenizerUtterance.tokenize('dragon'), { previous: 1 });
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);
  });

  it('Should custom intentResolvers using settings', () => {
    const resolverManager = new IntentsResolverManager({ intentResolvers: [new SimpleIntentsResolver({})] });
    expect(resolverManager.intentResolvers.length).to.equal(1);
  });

  it('Should default threshold using settings', () => {
    const resolverManager = new IntentsResolverManager();
    expect(resolverManager.settings.threshold).to.equal(0.75);
  });

  it('Should set 0.89 threshold using settings', () => {
    const resolverManager = new IntentsResolverManager({ threshold: 0.89 });
    expect(resolverManager.settings.threshold).to.equal(0.89);
  });

  it('Should add a resolver', () => {
    const resolverManager = new IntentsResolverManager();
    resolverManager.addIntentResolver(new SimpleIntentsResolver());
    expect(resolverManager.intentResolvers.length).to.equal(2);
  });
});
