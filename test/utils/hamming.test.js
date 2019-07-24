const chai = require('chai');

const { expect } = chai;

const hammingDistance = require('../../src/utils/comparator/hamming');

describe('Hamming distance', () => {
  const baseString = 'antidisestablishmentarianism';
  it('Hamming distance - from nothing', () => {
    const distance = hammingDistance();
    expect(distance).to.equal(0);
  });

  it('Hamming distance - just one parameter', () => {
    const distance = hammingDistance(baseString);
    expect(distance).to.equal(28);
  });

  it('Hamming distance - basic case', () => {
    const distance = hammingDistance(baseString, 'moredisestablishmentarianism');
    expect(distance).to.equal(4);
  });

  it('Hamming distance - should throw error', () => {
    expect(() => hammingDistance(baseString, 'menta')).to.throw(
      'Hamming - Length of strings a must be smaller or equal to b',
    );
  });
});
