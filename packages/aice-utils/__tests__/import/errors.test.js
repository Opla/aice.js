/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import errors', () => {
  it('return error without data', async () => {
    const result = await aiceUtils.importData();
    expect(result.error).to.equal('empty data');
  });
  it('return array Unknown schema', async () => {
    const result = await aiceUtils.importData({});
    expect(result).to.eql([{ error: 'Unknown schema', isValid: false }]);
  });
  it('return wrong data format', async () => {
    const result = await aiceUtils.importData([]);
    expect(result).to.eql([{ error: 'wrong data format', isValid: false }]);
  });
});
