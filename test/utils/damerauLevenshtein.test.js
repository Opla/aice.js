/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import Damerau from '../../src/utils/comparator/wordsComparator/damerau';
import levenshteinDistance from '../../src/utils/comparator/wordsComparator/levenshtein';

const { expect } = chai;

describe('Levenshtein distance', () => {
  const baseString = 'antidisestablishmentarianism';
  it('Levenshtein distance - from nothing', () => {
    const distance = levenshteinDistance();
    expect(distance).to.equal(0);
  });

  it('Levenshtein distance - just one parameter', () => {
    const distance = levenshteinDistance(baseString);
    expect(distance).to.equal(28);
  });
});

describe('Damerau distance', () => {
  const baseString = 'antidisestablishmentarianism';
  it('Damerau distance - inversion', () => {
    const distance = Damerau.distance(baseString, 'antidisestablishmentarianims');
    expect(distance).to.equal(1);
  });

  it('Damerau distance - wrong parameter', () => {
    const distance = Damerau.distance(baseString);
    expect(distance).to.equal(-1);
  });

  it('Damerau distance - wrong parameter (not a string)', () => {
    const distance = Damerau.distance(baseString, 1);
    expect(distance).to.equal(-1);
  });
});

describe('Damerau distanceAsync', () => {
  const baseString = 'antidisestablishmentarianism';
  it('Damerau distanceAsync - inversion', async () => {
    const distanceAsync = await Damerau.distanceAsync(baseString, 'antidisestablishmentarianims');
    expect(distanceAsync).to.equal(1);
  });

  it('Damerau distanceAsync - wrong parameter', async () => {
    await Damerau.distanceAsync(baseString).catch(err => expect(err).to.equal(-1));
  });

  it('Damerau distanceAsync - wrong parameter (not a string)', async () => {
    await Damerau.distanceAsync(baseString, 1).catch(err => expect(err).to.equal(-1));
  });
});

describe('Damerau minDistanceAsync', () => {
  const baseString = 'antidisestablishmentarianism';
  it('Damerau minDistanceAsync - throw error', async () => {
    await Damerau.distanceAsync(baseString, 1).catch(err => expect(err).to.equal(-1));
  });

  it('Damerau minDistanceAsync - throw error', async () => {
    await Damerau.minDistanceAsync(baseString, 'antidisestablishmentarianims').catch(err =>
      expect(err.message).to.equal('Damerau - A problem occurred because second parameter need to be an array'),
    );
  });

  it('Damerau minDistanceAsync - empty array list', async () => {
    const listOfWords = [];
    const indexMin = await Damerau.minDistanceAsync(baseString, listOfWords);

    // It's the baseString size (maximale distance)
    expect(indexMin).to.equal(28);
  });

  it('Damerau minDistanceAsync - listOfWords', async () => {
    const listOfWords = ['test', 'zntidisestablishmentarianism', 'something'];
    const indexMin = await Damerau.minDistanceAsync(baseString, listOfWords);

    expect(indexMin).to.equal(1);
  });
});
