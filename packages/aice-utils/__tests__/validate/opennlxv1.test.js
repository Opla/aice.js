/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('validate opennlxv1', () => {
  it('no empty file', async () => {
    const result = aiceUtils.validateData({}, 'opennlx');
    expect(result.isValid).to.equal(false);
  });
  it('minimal file', async () => {
    const result = aiceUtils.validateData(
      { name: 'demo', intents: [{ id: '1', input: '*', output: 'hello' }] },
      'opennlx',
    );
    expect(result.isValid).to.equal(true);
  });
});
