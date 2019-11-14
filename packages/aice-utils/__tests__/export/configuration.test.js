/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('export configurations', () => {
  it('simple configuration', async () => {
    const result = await aiceUtils.exportData({ configuration: { threshold: 0.75 } });
    expect(result).to.equal('{"configuration":{"threshold":0.75}}');
  });
});
