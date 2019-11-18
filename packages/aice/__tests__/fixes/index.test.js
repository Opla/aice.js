/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { IntentsResolverManager } from '../../src/intentResolvers';
import { InputExpressionTokenizer, AdvancedTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

const tokenizerInput = new InputExpressionTokenizer();
const tokenizerUtterance = AdvancedTokenizer;

describe('Fixes issues', async () => {
  // https://github.com/Opla/aice.js/issues/63
  it('Should exact match the unique result', async () => {
    const resolverManager = new IntentsResolverManager({});
    await resolverManager.train([
      { lang: 'us', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('f100a'), input: 'f100a' },
      { lang: 'us', topic: '*', intentid: 2, tokenizedInput: tokenizerInput.tokenize('f100b'), input: 'f100b' },
      { lang: 'us', topic: '*', intentid: 3, tokenizedInput: tokenizerInput.tokenize('{{*}}'), input: '{{*}}' },
    ]);

    // If an exact match is found it should be the unique result
    let result = await resolverManager.evaluate('us', tokenizerUtterance.tokenize('f100b'));
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);

    // If a sentence is composed of number+alpha+special only use exact match
    result = await resolverManager.evaluate('us', tokenizerUtterance.tokenize('f100c'));
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(3);
    expect(result[0].score).to.equal(0.9);
  });
});
