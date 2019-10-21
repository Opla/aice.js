/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { LazzyUnorderedComparator, UnorderedComparator } from '../../src/utils';
import {
  InputExpressionTokenizer,
  NamedEntityTokenizer,
  NERManager,
  SystemEntities,
} from '../../src/streamTransformers';

const { expect } = chai;

const tokenizerInput = new InputExpressionTokenizer();
const ner = new NERManager();
SystemEntities.getSystemEntities().forEach(e => {
  ner.addNamedEntity(e);
});
const tokenizerUtterance = new NamedEntityTokenizer(ner);
const LANG = 'en';

describe('LazzyUnorderedComparator', () => {
  const simpleUnorderedComparator = new LazzyUnorderedComparator();

  it('Should not match different sentences', () => {
    const input = 'My name is what';
    const utterance = 'you are slim';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
    expect(result.confidence).to.equal(0.0);
  });

  it('Should exact match same Sentences', () => {
    const input = 'Hello';
    const utterance = 'Hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should exact match same unordered Sentences', () => {
    const input = 'Hello my friend';
    const utterance = 'My friend Hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should exact match same unordered Sentences', () => {
    const input = 'Hello my friend';
    const utterance = 'My Hello friend';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should exact match same Sentences', () => {
    const input = 'Je suis beau, et vous aussi, vous êtes beau.';
    const utterance = 'Je suis beau, et vous aussi, vous êtes beau.';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should exact match same unordered Sentences', () => {
    const input = 'Je suis beau, et vous aussi, vous êtes beau.';
    const utterance = 'Vous êtes beau, et moi aussi, je suis beau.';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should not take in count ANY/ANYORNOTHING expressions', () => {
    const input = '{{*}} You are awesome {{^}}';
    const utterance = 'You are awesome my friend';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should weighting expressions - Match', () => {
    const input = 'My email is {{@email}}';
    const utterance = 'Email test@opla.ai';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(0.75); // score: 6/8
  });

  it('Should weighting expressions - No match', () => {
    const input = 'My email is {{@email}}';
    const utterance = "I don't want to give you my email";

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(0.25); // score: 2/8
  });
});

describe('UnorderedComparator', () => {
  const simpleUnorderedComparator = new UnorderedComparator();

  it('Should not match different sentences', () => {
    const input = 'My name is what';
    const utterance = 'you are slim';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
    expect(result.confidence).to.equal(0.0);
  });

  it('Should exact match same Sentences', () => {
    const input = 'Hello';
    const utterance = 'Hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should exact match same unordered Sentences', () => {
    const input = 'Hello my friend';
    const utterance = 'My friend Hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.be.closeTo(0.82, 0.01);
  });

  it('Should exact match same unordered Sentences', () => {
    const input = 'Hello my friend';
    const utterance = 'My Hello friend';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(0.5);
  });

  it('Should exact match same Sentences', () => {
    const input = 'Je suis beau, et vous aussi, vous êtes beau.';
    const utterance = 'Je suis beau, et vous aussi, vous êtes beau.';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should exact match same unordered Sentences', () => {
    const input = 'Je suis beau, et vous aussi, vous êtes beau.';
    const utterance = 'Vous êtes beau, et moi aussi, je suis beau.';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.be.closeTo(0.82, 0.01);
  });

  it('Should not take in count ANY/ANYORNOTHING expressions', () => {
    const input = '{{*}} You are awesome {{^}}';
    const utterance = 'You are awesome my friend';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should weighting expressions - Match', () => {
    const input = 'My email is {{@email}}';
    const utterance = 'Email test@opla.ai';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.be.closeTo(0.71, 0.01); // score: 6/8 but entropy lower the score
  });

  it('Should weighting expressions - Partial but relevant match', () => {
    const input = 'My email is {{@email}}';
    const utterance = 'test@opla.ai';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.be.closeTo(0.625, 0.01); // score: 5/8
  });

  it('Should weighting expressions - Full Match', () => {
    const input = '{{@email}}';
    const utterance = 'You just want an email here, so I give you my mail test@opla.ai';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.be.equal(1);
  });

  it('Should weighting expressions - No match', () => {
    const input = 'My email is {{@email}}';
    const utterance = "I don't want to give you my email";

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleUnorderedComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(0.25); // score: 2/8
  });
});
