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
    const result = await aiceUtils.validateData(
      { name: 'bot', avatar: 'bot', intents: [{ name: '1', input: { text: '*' }, output: 'hello' }] },
      'opennlx',
    );
    expect(result).to.eql({ isValid: true });
  });
  it('minimal file using schemaName=opennlx', async () => {
    const result = await aiceUtils.validateData(
      { name: 'bot', avatar: 'bot', intents: [{ name: '1', input: { text: '*' }, output: 'hello' }] },
      'opennlx',
    );
    expect(result).to.eql({ isValid: true });
  });
  it('minimal file using opennlx descriptor', async () => {
    const result = await aiceUtils.validateData({
      opennlx: { version: '2' },
      name: 'bot',
      avatar: 'bot',
      intents: [{ name: '1', input: { text: '*' }, output: 'hello' }],
    });
    expect(result).to.eql({ isValid: true, schema: { name: 'opennlx', version: '2' } });
  });
});
