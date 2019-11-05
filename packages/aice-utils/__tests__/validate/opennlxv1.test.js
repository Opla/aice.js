/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('validate opennlxv1', () => {
  it('no empty data', async () => {
    const result = aiceUtils.validateData({}, 'opennlx');
    expect(result.isValid).to.equal(false);
  });
  it('minimal model', async () => {
    const result = aiceUtils.validateData(
      { name: 'demo', intents: [{ id: '1', input: '*', output: 'hello' }] },
      'opennlx',
    );
    expect(result.isValid).to.equal(true);
  });
  it('complete model', async () => {
    const result = aiceUtils.validateData(
      {
        name: 'demo',
        intents: [
          { id: '1', input: ['hello', 'hi'], output: 'hello', order: 1 },
          {
            id: '2',
            input: ['{{email=@email'],
            output: [
              {
                type: 'condition',
                children: [
                  { name: 'action', value: 'email', type: 'item', text: 'Thanks' },
                  { name: 'action', value: undefined, type: 'item', text: 'Thanks' },
                ],
              },
            ],
            order: 2,
          },
        ],
      },
      'opennlx',
    );
    expect(result.isValid).to.equal(true);
  });
});
