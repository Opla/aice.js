/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('validate opennlxv2', () => {
  it('minimal file', async () => {
    const result = aiceUtils.validateData({ version: '2' }, 'opennlx');
    expect(result).to.eql({ isValid: true });
  });
});
