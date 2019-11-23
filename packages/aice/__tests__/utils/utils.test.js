/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { Utils } from '../../src/utils';

const { expect } = chai;

describe('Utils', () => {
  it('Utils - flatten', () => {
    const array1 = [1, 2, [3, 4]];
    expect(Utils.flatten(array1)).to.eql([1, 2, 3, 4]);
  });

  it('Utils - flatten empty array', () => {
    const array1 = [];
    expect(Utils.flatten(array1)).to.eql([]);
  });

  it('Utils - flatten one empty', () => {
    const array1 = [1, 2, []];
    expect(Utils.flatten(array1)).to.eql([1, 2]);
  });

  it('Utils - filterAsync', async () => {
    const array1 = [1, 2];
    const result = await Utils.filterAsync(array1, v => v > 1);
    expect(result).to.eql([2]);
  });

  it('Utils - addToArray', async () => {
    const array = [1, 2];
    const result = await Utils.addToArray(array, 3);
    expect(result).to.eql([1, 2, 3]);
  });
});
