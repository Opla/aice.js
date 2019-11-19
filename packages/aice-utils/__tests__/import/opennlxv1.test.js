/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import opennlxv1', () => {
  it('simple opennlxv1', async () => {
    const result = await aiceUtils.importData(
      '{ "name": "demo", "intents": [{ "id": "1", "input": "*", "output": "hello", "order": 0 }] }',
      { agentDefault: { locale: 'us', language: 'en', timezone: 'gmt', email: 'hello@domain.com' } },
    );
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: {
        name: 'demo',
        avatar: 'default',
        locale: 'us',
        language: 'en',
        timezone: 'gmt',
        email: 'hello@domain.com',
        intents: [{ name: '1', input: '*', output: 'hello', order: 0 }],
      },
      schema: { name: 'opennlx', version: '2' },
      isValid: true,
    });
  });
  it('simple opennlxv1 with opts.schemaName+version', async () => {
    const result = await aiceUtils.importData(
      {
        name: 'demo',
        avatar: 'default',
        intents: [{ name: '1', input: ['*'], output: ['hello'] }],
      },
      { schemaName: 'opennlx', version: '1' },
    );
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: {
        name: 'demo',
        avatar: 'default',
        intents: [{ name: '1', input: ['*'], output: ['hello'] }],
      },
      schema: { name: 'opennlx', version: '2' },
      isValid: true,
    });
  });
});
