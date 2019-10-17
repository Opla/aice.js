import chai from 'chai';
import { StrategyWordComparator, Comparator, LevenshteinStrategy, DamerauLevenshteinStrategy } from '../../src/utils';
import { InputExpressionTokenizer, ComplexeTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

const tokenizerInput = new InputExpressionTokenizer();
const tokenizerUtterance = ComplexeTokenizer;

describe('Simple Comparator', () => {
  const simpleComparator = new Comparator();

  it('Should not match different sentences', () => {
    const input = 'My name is what';
    const utterance = 'you are slim';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should exact match same Sentences', () => {
    const input = 'Hello';
    const utterance = 'Hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should match Sentences with special char', () => {
    const input = 'Hello';
    const utterance = 'Hello !';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should match Sentences with useless chars and spaces', () => {
    const input = 'Hello';
    const utterance = ' Hello,,, ,';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it('Should match Sentences with different case', () => {
    const input = 'Change all picture';
    const utterance = 'change ALL picture';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
  });

  it("Compare 'That a text' to 'that a' should be false", () => {
    const input = 'That a text';
    const utterance = 'that a';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
  });
});

describe('Levenshtein Comparator', () => {
  const levenshteinComparator = new Comparator(new LevenshteinStrategy());

  it('Should match Sentences with typing error', () => {
    const input = 'Hello';
    const utterance = 'Helli';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    // expect(result.confidence).to.equal(0.9);
  });

  it('Should match Complexe Sentences with typing error', () => {
    const input = '{{^}}my name is {{name=*}} shady {{^}}';
    const utterance = 'Hello, my nqme is slime shady ! REPU';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    // expect(result.confidence).to.equal(0.9);
  });

  it('Should match Complexe Sentences with typing error 2', () => {
    const input = '{{^}}my name is {{name=*}} shady {{^}}';
    const utterance = 'Hello, my nqme is slime shody ! REPU';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    // expect(result.confidence).to.equal(0.9);
  });

  it("Shouldn't match Sentences with too many typing error", () => {
    const input = 'Hello';
    const utterance = 'Hemmi';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
    // expect(result.confidence).to.equal(0.9);
  });
});

describe('Demerau-Levenshtein Comparator', () => {
  const damerauComparator = new Comparator(new DamerauLevenshteinStrategy());
  it('Should match Sentences with typing error', () => {
    const input = 'Hello';
    const utterance = 'Helli';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = damerauComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
  });

  it('Should match Complexe Sentences with typing error', () => {
    const input = '{{^}}my name is {{name=*}} shady {{^}}';
    const utterance = 'Hello, my nqme is slime shady !!! Some text';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = damerauComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    // expect(result.confidence).to.equal(0.9);
  });

  it('Should match Complexe Sentences with typing error 2', () => {
    const input = '{{^}}my name is {{name=*}} shady {{^}}';
    const utterance = 'Hello, my nqme is slim shody !!!!!! REPU';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = damerauComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
  });

  it("Shouldn't match Sentences with too many typing error", () => {
    const input = 'Hello';
    const utterance = 'Hemmi';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = damerauComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
  });

  it('Should match Sentences with pertutations', () => {
    const input = 'Hello my friend';
    const utterance = 'ehllo ym nriend';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = damerauComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    // expect(result.confidence).to.equal(0.9);
  });

  it('Should match Sentences with pertutations', () => {
    const input = 'Hello my friend';
    const utterance = 'ehllo my rfiend';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = damerauComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    // expect(result.confidence).to.equal(0.9);
  });

  it("Shouldn't match Sentences", () => {
    const input = 'sandwichs';
    const utterance = 'catacombes';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = damerauComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
  });
});

describe('Expression Any/AnyOrNothing simpleComparator', () => {
  const simpleComparator = new Comparator();
  it('Compare "{{*}}" to "" should be false', () => {
    const input = '{{*}}';
    const utterance = '';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
    expect(result.confidence).to.equal(1.0);
  });

  it('Compare "{{*}}" to "something" should be true', () => {
    const input = '{{*}}';
    const utterance = 'something';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.any).to.equal('something');
  });

  it('Compare "{{^}}" to "" should be true', () => {
    const input = '{{^}}';
    const utterance = '';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('');
  });

  it('Compare "{{^}}" to "something" should be true', () => {
    const input = '{{^}}';
    const utterance = 'something';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('something');
  });

  it('Compare "Hello {{*}}" to "Hello Bob!" should be true', () => {
    const input = 'Hello {{*}}';
    const utterance = 'Hello Bob!';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.any).to.equal('Bob');
  });

  it('Compare "Hello {{^}}" to "Hello Bob!" should be true', () => {
    const input = 'Hello {{^}}';
    const utterance = 'Hello Bob!';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('Bob');
  });

  it('Compare "{{^}}Hello{{^}}" to "Hello" should be true', () => {
    const input = '{{^}}Hello{{^}}';
    const utterance = 'Hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('');
  });

  it('Compare "{{^}}Hello{{^}}" to "Hello Bob!" should be true', () => {
    const input = '{{^}}Hello{{^}}';
    const utterance = 'Bob Hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('Bob');
  });
});

describe('Expression Any/AnyOrNothing levenshteinComparator', () => {
  const levenshteinComparator = new Comparator(new LevenshteinStrategy());
  it('Compare "{{*}}" to "" should be false', () => {
    const input = '{{*}}';
    const utterance = '';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
    expect(result.confidence).to.equal(1.0);
  });

  it('Compare "{{*}}" to "something" should be true', () => {
    const input = '{{*}}';
    const utterance = 'something';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.any).to.equal('something');
  });

  it('Compare "{{^}}" to "" should be true', () => {
    const input = '{{^}}';
    const utterance = '';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('');
  });

  it('Compare "{{^}}" to "something" should be true', () => {
    const input = '{{^}}';
    const utterance = 'something';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('something');
  });

  it('Compare "Hello {{*}}" to "Hello Bob!" should be true', () => {
    const input = 'Hello {{*}}';
    const utterance = 'Hello Bob!';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.any).to.equal('Bob');
  });

  it('Compare "Hello {{^}}" to "Hello Bob!" should be true', () => {
    const input = 'Hello {{^}}';
    const utterance = 'Hello Bob!';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(utterance);

    const result = levenshteinComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.confidence).to.equal(1.0);
    expect(result.context.anyornothing).to.equal('Bob');
  });
});

describe('Abtract class - StrategyWordComparator', () => {
  const abstractComparator = new StrategyWordComparator('abstract');

  it('Should throw an error if no compare definition', () => {
    expect(() => abstractComparator.compare()).to.throw(
      'StrategyWordComparator - Cannot use compare function on abstract class',
    );
  });
});
