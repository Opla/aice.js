import chai from 'chai';
import { Sentence } from '../../src/streamTransformers';

const { expect } = chai;

describe('Sentence', () => {
  it('Create a new sentence', () => {
    const sentence = new Sentence();
    expect(sentence).not.to.equal(null);
    expect(sentence.raw).to.equal('');
  });

  it('Create a new sentence', () => {
    const utterance = 'Test sentence for test purpose';
    const sentence = new Sentence(utterance);
    expect(sentence).not.to.equal(null);
    expect(sentence.raw).to.equal(utterance);
  });

  it('Stream handled by sentence', () => {
    const utterance = 'Test sentence for text purpose';
    const sentence = new Sentence(utterance);
    expect(sentence.raw).to.equal(utterance);

    const utterance2 = ' some more text';
    sentence.write(utterance2);
    expect(sentence.raw).to.equal(utterance + utterance2);
  });
});
