/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import opennlxv2', () => {
  it('simple opennlxv2', async () => {
    const result = await aiceUtils.importData({
      name: 'bot',
      avatar: 'bot',
      intents: [{ name: '1', input: { text: '*' }, output: 'hello' }],
    });
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: {
        name: 'bot',
        avatar: 'bot',
        intents: [{ name: '1', input: { text: '*' }, output: 'hello' }],
      },
      schema: { name: 'opennlx', version: '2' },
      isValid: true,
    });
  });
});
