import chai from 'chai';
import { SimpleTokenizer, ComplexeTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

describe('Simple Tokenizer', () => {
  it('Should tokenize "Hello"', () => {
    const textToTokenize = 'Hello';
    const tokenizedText = SimpleTokenizer.tokenize(textToTokenize);

    expect(tokenizedText.get().value.text).to.equal('Hello');
  });

  it('Should tokenize "Hello my friend"', () => {
    const textToTokenize = 'Hello my friend';
    const tokenizedText = SimpleTokenizer.tokenize(textToTokenize);

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

describe('Complexe Tokenizer', () => {
  it('Should tokenize "Hello"', () => {
    const textToTokenize = 'Hello';
    const tokenizedText = ComplexeTokenizer.tokenize(textToTokenize);

    expect(tokenizedText.get().value.text).to.equal('Hello');
  });

  it('Should tokenize "Hello my friend"', () => {
    const textToTokenize = 'Hello my friend';
    const tokenizedText = SimpleTokenizer.tokenize(textToTokenize);

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
