/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { BasicTokenizer, AdvancedTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

describe('Simple Tokenizer', () => {
  it('Should tokenize "Hello"', () => {
    const textToTokenize = 'Hello';
    const tokenizedText = BasicTokenizer.tokenize(textToTokenize);

    expect(tokenizedText.get().value.text).to.equal('Hello');
  });

  it('Should tokenize "Hello my friend"', () => {
    const textToTokenize = 'Hello my friend';
    const tokenizedText = BasicTokenizer.tokenize(textToTokenize);

    const it = tokenizedText.values();
    let node = it.next();
    expect(node.value.text).to.equal('Hello');
    node = it.next();
    expect(node.value.text).to.equal('my');
    node = it.next();
    expect(node.value.text).to.equal('friend');
    node = it.next();
    expect(node.value).to.equal(undefined);
  });
});

describe('Tricky Tokenizer', () => {
  it('Should tokenize "Hello"', () => {
    const textToTokenize = 'Hello';
    const tokenizedText = AdvancedTokenizer.tokenize(textToTokenize);

    expect(tokenizedText.get().value.text).to.equal('Hello');
  });

  it('Should tokenize "Hello my friend"', () => {
    const textToTokenize = 'Hello my friend';
    const tokenizedText = BasicTokenizer.tokenize(textToTokenize);

    const it = tokenizedText.values();
    let node = it.next();
    expect(node.value.text).to.equal('Hello');
    node = it.next();
    expect(node.value.text).to.equal('my');
    node = it.next();
    expect(node.value.text).to.equal('friend');
    node = it.next();
    expect(node.value).to.equal(undefined);
  });
});
