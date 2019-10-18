/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { Comparator } from '../../src/utils';
import { InputExpressionTokenizer, AdvancedTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

const tokenizerInput = new InputExpressionTokenizer();
const tokenizerUtterance = AdvancedTokenizer;

describe('Context Comparator', () => {
  const simpleComparator = new Comparator();
  it('Should set context.myVariable ANY', () => {
    const input = '{{myVariable=*}}';
    const utterance = 'some text';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.myVariable).to.equal('some text');
  });

  it('Should set context.any ANY', () => {
    const input = '{{*}}';
    const utterance = 'some text';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.any).to.equal('some text');
  });

  it('Should set context.myVariable ANYORNOTHING', () => {
    const input = '{{myVariable=^}}';
    const utterance = 'some text';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.myVariable).to.equal('some text');
  });

  it('Should set context.myVariable ANYORNOTHING', () => {
    const input = '{{myVariable=^}}';
    const utterance = 'some text';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.myVariable).to.equal('some text');
  });

  it('Should automatically set multiple unnamed variables ({{*}})', () => {
    const input = '{{*}} is {{*}}';
    const utterance = 'This bot is awesome';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.any).to.equal('This bot');
    expect(result.context.any_1).to.equal('awesome');
  });

  it('Should automatically set multiple unnamed variables ({{^}})', () => {
    const input = '{{^}} is {{^}}';
    const utterance = 'This bot is awesome';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('This bot');
    expect(result.context.anyornothing_1).to.equal('awesome');
  });

  it('Should automatically set multiple unnamed variables ({{^}} not catch case)', () => {
    const input = '{{^}} your {{^}}';
    const utterance = 'your awesome';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('');
    expect(result.context.anyornothing_1).to.equal('awesome');
  });
});
