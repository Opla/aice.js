/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('validate configurations', () => {
  it('threshold=0.75', async () => {
    const result = aiceUtils.validateData({ threshold: 0.75 }, 'aice-configuration');
    expect(result).to.eql({ isValid: true });
  });
  it('Not valid property', async () => {
    const result = aiceUtils.validateData({ dummy: 'value' }, 'aice-configuration');
    expect(result.isValid).to.eql(false);
  });
});
